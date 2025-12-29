import { check, validationResult } from "express-validator";
import { supabase } from "../../config/supabaseClient.js";

const setAuthCookies = (res, session) => {
  const { access_token, refresh_token, expires_in } = session;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "lax",
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

  await check("email").isEmail().withMessage("Email inválido").normalizeEmail().run(req);
  await check("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres").run(req);

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
      message: "Registro exitoso. Revisa tu correo para confirmar la cuenta.",
      user: { id: data.user?.id, email: data.user?.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error interno en registro", details: err.message });
  }
};

const confirmEmail = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Falta el código de confirmación" });
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.session) {
      setAuthCookies(res, data.session);
    }

    return res.status(200).json({ message: "Cuenta confirmada correctamente", user: data.user });
  } catch (err) {
    return res.status(500).json({ message: "Error al confirmar la cuenta", details: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  await check("email").isEmail().withMessage("Email inválido").normalizeEmail().run(req);
  await check("password").notEmpty().withMessage("Contraseña requerida").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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

    return res.status(200).json({ message: "Login exitoso", user: data.user });
  } catch (err) {
    return res.status(500).json({ message: "Error al iniciar sesión", details: err.message });
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
    return res.status(200).json({ message: "Sesión cerrada" });
  } catch (err) {
    return res.status(500).json({ message: "Error al cerrar sesión", details: err.message });
  }
};

export { register, confirmEmail, login, logout };
