import React from 'react'
//jsx
//why this comp render twice
function Second(parms) {
  console.log(parms)
  
  return (
    <>
    <div>Second</div>
    <p>hello {parms.name} , good afternoon</p>
    {parms.children}
    </>
   )
}

export default Second