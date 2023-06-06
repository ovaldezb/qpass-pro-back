import mongoose from 'mongoose';
var { Schema } = mongoose;

var CondominioSchema = new Schema({
  id:String,
  Condominio:String,
  Direccion:String,
  Codigopostal: String,
  Telefono: String
});

const Condominio  = mongoose.model('Condominio',CondominioSchema);

const condominioDB = (mongoUri:string)=>{
  const connectionHandler = mongoose.connect(mongoUri,{
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  });
  return {
    close: ()=>{
      mongoose.connection.close();
    },
    create: (params:any)=>{
      const newCondominio = new Condominio({
        nombre: params.nombre,
        direccion: params.direccion,
        codigopostal: params.codigopostal,
        telefono: params.telefono
      }).save();
      return newCondominio;
    },
    getById: (idCodominio:String)=>{
      return Condominio.findById(idCodominio).then((response:any) =>{
        return response;
      });
    },
    getAllCondominios:()=>{
      return Condominio.find().sort('_id');
    },
    deleteCondominio:(idCondominio:String)=>{
      return Condominio.findByIdAndDelete({_id:idCondominio});
    },
    updateCondominio:(idCondominio:String, params:any)=>{
      return Condominio.findOneAndUpdate({_id:idCondominio},params,{'new':true});
    }
  }
}

module.exports = condominioDB;