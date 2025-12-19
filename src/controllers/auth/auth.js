import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Configuración del cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Controlador para registrar un nuevo usuario
// Controlador para registrar un nuevo usuario
const registerUser = async (req, res) => {
  const { email, password, name } = req.body; // Se añade el campo 'name'

  try {
    // Crear el usuario en Supabase
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return res.status(400).json({ error: signUpError.message });
    }

    // Crear el perfil del usuario
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.user.id,
      name,
    });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    const { error: user_rolesError } = await supabase.from("user_roles").insert({
        user_id: user.user.id,
      });

    if (user_rolesError) {
      return res.status(400).json({ error: user_rolesError.message });
    }

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: user.user,
    });
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Controlador para iniciar sesión
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: "Inicio de sesión exitoso", data });
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Controlador para cerrar sesión
const logoutUser = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: "Cierre de sesión exitoso" });
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export { registerUser, loginUser, logoutUser };
