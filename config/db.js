import mongoose from "mongoose";

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a la bbdd');
    }
    catch{
        console.error("Error en la conexión a la bbdd")
        process.exit(1)
    }
}

export default connectDB;