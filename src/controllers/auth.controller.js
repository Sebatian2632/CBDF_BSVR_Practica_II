const usuarios = require('../models/auth.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { correo, clave } = req.body;

        if (!correo || !clave) {
            return res.status(400).json({
                estado: 0,
                mensaje: "Se deben proporcionar el correo y la clave en el cuerpo de la solicitud",
            });
        } else {
            const usuario = await usuarios.findOne({ correo: correo });

            if (!usuario) {
                return res.status(404).json({
                    estado: 0,
                    mensaje: "Usuario no encontrado",
                });
            } else {
                const resultadoComparacion = await bcrypt.compare(clave, usuario.clave);

                if (resultadoComparacion) {
                    // Generar un token JWT
                    const token = jwt.sign({ usuarioId: usuario._id, correo: usuario.correo }, 'secreto', { expiresIn: '1h' });

                    // Enviar el token en la respuesta
                    res.status(200).json({
                        estado: 1,
                        mensaje: "Acceso correcto",
                        token: token,
                    });
                } else {
                    res.status(401).json({
                        estado: 0,
                        mensaje: "Credenciales incorrectas",
                    });
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            error: error.message,
        });
    }
};

exports.addUser = async(req,res) =>{
    try {
        const {nombre, apellidos, usuario, correo, clave} = req.body;
        if (nombre ==undefined || apellidos==undefined || usuario==undefined || correo==undefined || clave==undefined) {
            res.status(400).json({
                estado: 0,
                mensaje: "Faltan parámetros"
            })
        } else {
            const usuarioEncontrado = await usuarios.findOne({$or: [{correo:correo}, {usuario:usuario}]}).exec();
            if (usuarioEncontrado) {
                res.status(200).json({
                    estado: 0,
                    mensaje: "Usuario y/o correo ya regisrado"
                })
            } else {               
            const salt = await bcrypt.genSalt(8);
            const usuarioC = await usuarios.create({nombre,apellidos,usuario,correo,clave:await bcrypt.hash(clave,salt)})
            if (usuarioC) {
                res.status(200).json({
                    estado: 1,
                    mensaje: "Usuario creado correctamente",
                    usuario: usuarioC
                })
            } else {
                res.status(500).json({
                    estado: 0,
                    mensaje: "Ocurrió un error desconocido"
                })
            }
        }
    }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido"
        })
    }
}