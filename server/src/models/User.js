const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
  label: {type:String, default:'Home'}, line:{type:String, default:''}, landmark:{type:String, default:''},
  pincode:{type:String, default:''}, lat:{type:Number}, lng:{type:Number}
}, {_id:false});
const userSchema = new mongoose.Schema({
  role:{type:String, enum:['customer','partner', 'admin'], required:true},
  mobile:{type:String, required:true, match:/^[6-9]\d{9}$/},
  email:{type:String, trim:true, lowercase:true, match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/},
  name:{type:String, required:true, trim:true, minlength:2, maxlength:60},
  shopName:{type:String, maxlength:80},
  address:{type:addressSchema, default:undefined},
  radiusKm:{type:Number, enum:[2,3,5,8,10,15], default:5},
  online:{type:Boolean, default:false},
  ratingSum:{type:Number, default:0}, ratingCount:{type:Number, default:0}
}, {timestamps:true});
userSchema.index({role:1,mobile:1},{unique:true});
userSchema.index({role:1,email:1},{unique:true,partialFilterExpression:{email:{$type:'string'}}});
module.exports = mongoose.model('User', userSchema);
