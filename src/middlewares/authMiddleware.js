import { supabase } from "../config/supabaseClient.js";

// Verifica la sesión de Supabase usando el access token guardado en cookies.
const validateCookies = async (req, res, next) => {
  const accessToken = req.cookies?.["sb-access-token"];

  if (!accessToken) {
    return res.status(401).json({ message: "No se ha proporcionado un token" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return res.status(401).json({ message: "Token inválido" });
    }

    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export default validateCookies;
