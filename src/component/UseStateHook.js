import React,{useState} from 'react'
function intializeValue(){

   console.log("Intialize the value")
   return {count:5,theme:'blue'};
}

function UseStateHook() {
  
 let [ourObject,setOurObject]=useState(intializeValue);
 const count=ourObject.count;


const changeTheme=()=>
 {
   const theme=ourObject.theme==='blue'?'green':'blue';
   setOurObject({...ourObject,theme:theme});

 }


 const deCreament=()=>
 {
   const theme=ourObject.theme==='blue'?'green':'blue';
   setOurObject({ ...ourObject, count: ourObject.count - 1 ,theme:theme});
   
 }

 const increament=()=>
 {
   const theme=ourObject.theme==='blue'?'green':'blue';
   setOurObject({ ...ourObject, count: ourObject.count + 1 ,theme:theme});
 }

  return (
    <div>
    <button onClick={deCreament}>-</button>
    <span>{ourObject.count}</span>
    <span>{ourObject.theme}</span>
    <button onClick={increament}>+</button>   
    </div>
  )
}

export default UseStateHook