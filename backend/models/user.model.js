import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const categories = [
  "Education & Skill Development",
  "Sports & Cultural Events",
  "Health & Well-being",
  "Women Empowerment",
  "Environmental Sustainability",
  "Social Inclusion & Awareness"
];

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    email: {
        type: String,
        required: true,
      },
    password: {
        type: String,
        required: true,
        select: false,
      },
    role: {
        type: String,
        enum: ["Admin", "User", "Event Organiser"],
        default: "User",
      },
      accountVerified:{
        type:Boolean,
        default:false
      },
      events:[
        {
            eventId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Event"
            },
            eventDate:{
                type:Date
            },
            tasks:[
                {
                    taskId:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"Task"
                    },
                }
            ]
        }
      ],
      avatar:{ type: String },
      location: { type: String },
      category: { type: String, enum: categories, required: true }, 
      availability: {
          weekdays: { type: Boolean, default: false },
          weekends: { type: Boolean, default: false }
      },
      verificationCode: Number,
      verificationCodeExpire:Date,
      resetPasswordToken:String,
      resetPasswordExpires:Date
    },{
    timestamps: true
});

userSchema.methods.generateToken =function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    })
}

userSchema.methods.generateVerificationCode = function () {
    function geenerateRandomFiveDigitNumber() {
      const firstDigit = Math.floor(Math.random() * 9) + 1;
      const remainingDigits = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, 0);
      return parseInt(firstDigit + remainingDigits);
    }
  
    const verificationCode = geenerateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
    return verificationCode;
  };

  userSchema.methods.getResetPasswordToken= function(){
      const resetToken = crypto.randomBytes(20).toString('hex');
      this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      return resetToken;
  }
export const User =mongoose.model("User",userSchema);