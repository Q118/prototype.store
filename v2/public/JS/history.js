/**
 * @summary this file to bring in the blob data from the /hello route parse and display to front end
 */

const historyContainer = document.getElementById("history-container");
const titleBlob = document.getElementById("title-blob");
const requestDetailContainer = document.getElementById("request-details");
const requestLiteContainer = document.getElementById("request-lite");
const requestHeadersContainer = document.getElementById("request-headers");
const responseHeadersContainer = document.getElementById("response-headers");
const responseDetailContainer = document.getElementById("response-details");

//TODO will make this dynamic later, like to loop and display in order of history but for now lets just display the two of them for the mock but also ++ add pagination    

// get the data from /hello route and put it in innerHTML

//prepend <i class="fas fa-chevron-up"></i>


fetch("/hello")
    .then((response) => response.json())
    .then((data) => {
        const parsedDataOne = JSON.parse(data[0].data);
        const parsedDataTwo = JSON.parse(data[1].data);

        titleBlob.innerHTML = data[0].name.replace(".json", "");



        for (let [key, value]
            of Object.entries(parsedDataOne.request)) {
            if (key === "body" || key === "headers") {
                continue;
            }
            if (key === "startTime" || key === "endTime") {
                value = new Date(value);
            }
            const div = document.createElement("div");
            div.innerHTML = `${key}: ${value}`;
            requestLiteContainer.appendChild(div);
        }

        //handle headers and body
        const handleNested = (obj) => {
            const pre = document.createElement("pre");
            pre.innerHTML = JSON.stringify(obj, undefined, 2);

            if (obj === parsedDataOne.request.headers) {
                requestHeadersContainer.appendChild(pre)
            } else if (obj === parsedDataOne.request.body) {
                requestDetailContainer.appendChild(pre)
            } else if (obj === parsedDataOne.response.headers) {
                responseHeadersContainer.appendChild(pre)
            } else if (obj === parsedDataOne.response.body) { 
                responseDetailContainer.appendChild(pre)
            } else {
                console.log("something went wrong parsing the nested objects")
            }
        }

        handleNested(parsedDataOne.request.body);
        handleNested(parsedDataOne.request.headers);
        handleNested(parsedDataOne.response.headers);
        handleNested(parsedDataOne.response.body);
        

    }).catch((error) => {
        console.log(error);
    })