import { check, validationResult } from "express-validator";
import { supabase } from "../../config/supabaseClient.js";

const setAuthCookies = (res, session) => {
  const { access_token, refresh_token, expires_in } = session;
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: expires_in ? expires_in * 1000 : undefined,
  };

  res.cookie("sb-access-token", access_token, cookieOptions);
  // refresh tokens are long-lived, keep a one-week window by default
  res.cookie("sb-refresh-token", refresh_token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res) => {
  const { email, password } = req.body;

  await check("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/confirm",
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: "Signup successful. Check your email to confirm your account.",
      user: { id: data.user?.id, email: data.user?.email },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal signup error", details: err.message });
  }
};

const confirmEmail = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Confirmation code is missing" });
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.session) {
      setAuthCookies(res, data.session);
    }

    return res
      .status(200)
      .json({ message: "Account confirmed successfully", user: data.user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error confirming account", details: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  await check("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({message: `Validation failed ${errors.array()}` , errors: errors.array() });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.session) {
      setAuthCookies(res, data.session);
    }

    return res
      .status(200)
      .json({ message: "Login successful", user: data.user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error signing in", details: err.message });
  }
};

const logout = async (req, res) => {
  try {
    // Limpiamos cookies locales; revocar tokens requeriría la service role key
    res.clearCookie("sb-access-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("sb-refresh-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error signing out", details: err.message });
  }
};

export { register, confirmEmail, login, logout };
