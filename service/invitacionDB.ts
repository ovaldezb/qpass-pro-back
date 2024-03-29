import mongoose from 'mongoose';
const { Schema } = mongoose;

var InvitacionSchema = new Schema({
    id:String,
    anfitrion: {type:String},
    asunto:String,
    duracion:Number,
    nombreInvitado:String,
    telefonoInvitado:String,
    correoInvitado:String,
    fechaEvento:Date,
    horaEvento:String,
    detalle:String,
    lugar:String,
    notificarEntrada:Boolean,
    placas: String,
    tarjeton: String,
    horaIngreso: Date,
    dejaId: Boolean,
    esRecurrente:Boolean,
    numRepeticiones:Number,
    horaCreacion: Date

});

const Invitacion  = mongoose.model('Invitacion',InvitacionSchema);

const invitacionDB = (mongoUri: string) =>{
  const connectionHandler = mongoose.connect(mongoUri,{
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  });

  return {
    close: ()=>{
      mongoose.connection.close();
    },
    create:(params:any)=>{
      const invitacion = new Invitacion({
        anfitrion : params.anfitrion,
        asunto : params.asunto,
        duracion : params.duracion,
        nombreInvitado : params.nombreInvitado,
        telefonoInvitado: params.telefonoInvitado,
        correoInvitado : params.correoInvitado,
        fechaEvento : params.fechaEvento,
        horaEvento : params.horaEvento,
        detalle : params.detalle,
        lugar : params.lugar,
        notificarEntrada : params.notificarEntrada,
        esRecurrente: params.esRecurrente,
        numRepeticiones:params.numRepeticiones,
        horaCreacion: new Date()
      }).save();
      return invitacion;
    },
    getById:(idInvitacion:String)=>{
      return Invitacion.findById(idInvitacion).then((response:any)=>{
        return response;
      });
    },
    getAllInvitaciones:()=>{
      return Invitacion.find().sort('_id');
    },
    deleteInvitacion:(idInvitacion:String)=>{
      return Invitacion.findByIdAndDelete({_id:idInvitacion});
    },
    updateInvitacion:(idInvitacion:String, params:any)=>{
      return Invitacion.findOneAndUpdate({_id:idInvitacion},params,{'new':true});
    }
  }
};

module.exports = invitacionDB;