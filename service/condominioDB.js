const mongoose = require('mongoose');
const { Schema } = mongoose;

var CondominioSchema = Schema({
  id:String,
  nombre:String,
  direccion:String,
  codigopostal: String,
  telefono: String
});

const Condominio  = mongoose.model('Condominio',CondominioSchema);

const condominioDB = (mongoUri)=>{
  mongoose.connect(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return {
    close: ()=>{
      mongoose.connection.close();
    },
    create: (params)=>{
      const newCondominio = new Condominio({
        nombre: params.nombre,
        direccion: params.direccion,
        codigopostal: params.codigopostal,
        telefono: params.telefono
      }).save();
      return newCondominio;
    },
    getById: (idCodominio)=>{
      return Condominio.findById(idCodominio).then(response =>{
        return response;
      });
    },
    getAllCondominios:()=>{
      return Condominio.find().sort('_id');
    },
    deleteCondominio:(idCodominio)=>{
      return Condominio.findByIdAndDelete({_id:idCodominio});
    },
    updateCondominio:(idCodominio, params)=>{
      return Condominio.findOneAndUpdate({_id:idCodominio},params,{'new':true});
    }
  }
}

module.exports = condominioDB;