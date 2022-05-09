const { v4: genId } = require('uuid');
const ID = genId();
console.log(ID);

//set time out to display the time once and then disply again after 668 ms
console.log(Date.now());
setTimeout(function () {
    console.log(Date.now());
}, 668);




// const data = [
//   {
//     "name": "jfeirthweiohrtioahf",
//     "data": {
//       "type": "test",
//       "value": "test",
//       "created": "2020-01-01T00:00:00.000Z"
//     }
//   }, {
//     "name": "nmn,n,nlkklil",
//     "data": {
//       "type": "test",
//       "value": "test",
//       "created": "2020-02-01T00:00:00.000Z"
//     }
//   }
// ]

// console.log(typeof data) //object!

// for (let [key, value]
//   of Object.entries(data)) {
//   if (key === "body" || key === "headers") {
//     continue;
//   }
//   if (key === "startTime" || key === "endTime") {
//     value = new Date(value).toLocaleString();
//   }
//   console.log(key)
// }

// data.forEach(element => {
//   console.log(element.name)
// });

// for (let [key, value] of Object.entries(parsedDataOne.request)) {
//   if (key === "body" || key === "headers") { continue; }
//   if (key === "startTime" || key === "endTime") {value = new Date(value);}
//   // const div = document.createElement("div");
//   div.innerHTML = `${key}: ${value}`;

//   // requestLiteContainer.appendChild(div);
// }

// <%for (let [key, value] of Object.entries(blobs[0].data.request)) { %>
//   <% if (key==="body" || key==="headers" ) { continue; }%>
//       <%if (key==="startTime" || key==="endTime" ) {value=new Date(value);} %>

//           <div id="request-lite" class="aBox">
//               <%= key %>: <%= value %>
//           </div>
//           <% } %>


