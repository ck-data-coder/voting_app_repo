import mongoose from "mongoose";
const schema=mongoose.Schema;
const userSchema=new schema({
    election:{ time:{
        type:String,
        require:true
    },
        voting_data:[{
    voter_name:{
        type:String,
        require:true,  
    },
    epic_no:{
    type:String,
    require:true
    },
    party_name:{
        type:String,
        require:true,  
   }}]}
 },
   {
    versionKey:false
  })
const userSignupSchema=new schema({
    name:{
        type:String,
        require:true
      
    },
    email:{
        type:String,
        require:true,
        unique:true
    },

password:{
    type:String,
    require:true
}
},
{
    versionKey:false
})

const otpSchema=new schema({
    email:{
        type:String,
        require:true,
        unique:true
    },
    otp:{
        type:String,
        require:true
    },
    time:{
        type:Number,
        require:true
    }
},
{
    versionKey:false
})


const VotercardData=new schema({
    state:{
        type:String,
        require:true,
     
    },
    district:{
        type:String,
        require:true
    },
    epic_no:{
        type:String,
        require:true,
     
    },
    votercardfile:{
        type:String,
        require:true
    },
    assembly_no:{
        type:String,
        require:true,
     
    },
    assembly_name:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true,
     
    },
    fname:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        require:true,
     
    },
    dob:{
        type:String,
        require:true
    },
    aadhar:{
        type:String,
        require:true,
     
    },
    house_no:{
        type:String,
        require:true
    },
    area:{
        type:String,
        require:true,
     
    },
    village:{
        type:String,
        require:true
    },
    post_office:{
        type:String,
        require:true
    },
    pincode:{
        type:String,
        require:true,
     
    },
    taluka:{
        type:String,
        require:true
    },
    address_proof:{
        type:String,
        require:true,  
    },
    picfile:{
        type:String,
        require:true
    },
    time:{
        type:String,
        require:true
    }
},
{
    versionKey:false
})

const forgetPasswordSchema=new schema({
    email:{
        type:String,
        require:true,
        unique:true
    },
    otp:{
        type:String,
        require:true
    },
    time:{
        type:Number,
        require:true
    }
},
{
    versionKey:false
})

const electionSchema=new schema({
    id:{
        type:String
    },
    targettime:{
        type:String
       
    },
    timecalToDisplayElectionButton:{
        type:String
    },
    election:{
        type:String
    },
    result:{
        type:String
    }
},
{
    versionKey:false
})


const otpModel=mongoose.model('otpdata',otpSchema)
const VotercardModel=mongoose.model('VotercardData',VotercardData)
const userModel=mongoose.model('votingDatas',userSchema)
const usersignupModel=mongoose.model('userdata',userSignupSchema)
const forgetPasswordModel=mongoose.model('forgetPassword',forgetPasswordSchema)
const electionModel=mongoose.model('electiontime',electionSchema)

export { userModel,usersignupModel,otpModel,VotercardModel,forgetPasswordModel,electionModel};