import mongoose from 'mongoose';

const { Schema } = mongoose;

var UsuarioSchema = new Schema({
  id: String,
  Nombre:String,
  Apellidos:String,
  Condominio: String,
  Direccion:String,
  tipoUsuario:String,
  fechaNacimiento:String,
  rfcOrcurp: String,
  correo: String,
  telefono:String
});

const Usuario  = mongoose.model('Usuario',UsuarioSchema);

const usuarioDB = (mongoUri: string)=>{
  mongoose.connect(mongoUri,{  });

  return {
    close: ()=>{
      mongoose.connection.close();
    },
    create:(params:any)=>{
      const usuario = new Usuario({
        Nombre : params.Nombre,
        Apellidos : params.Apellidos,
        Condominio: params.Condominio,
        Direccion:params.Direccion,
        tipoUsuario:params.tipoUsuario,
        fechaNacimiento:params.fechaNacimiento,
        rfcOrcurp: params.rfcOrcurp,
        correo: params.correo,
        telefono:params.telefono
      }).save();
      return usuario;
    },
    getById:(idUsuario: any)=>{
      return Usuario.findById(idUsuario).then((response)=>{
        return response;
      });
    },
    getUsurioByemail:(correo:string)=>{
      return Usuario.findOne({correo:correo})
      .then(response=>{
        return {usuario:response}
      });
    },
    getAllUsuarios:()=>{
      return Usuario.find().sort('_id');
    },
    deleteUsuario:(idUsuario: any)=>{
      return Usuario.findByIdAndDelete({_id:idUsuario});
    },
    updateUsuario:(idUsuario:string, params:any)=>{
      return Usuario.findOneAndUpdate({_id:idUsuario},params,{'new':true});
    },
    getByParameter:(parameter:any)=>{
      return Usuario.find({email:parameter});
    }
  }
}

module.exports = usuarioDB;
