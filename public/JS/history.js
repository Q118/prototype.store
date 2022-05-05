/**
 * @summary this file to bring in the blob data from the /hello route parse and display to front end
 */

const historyContainer = document.getElementById("history-container");
const titleBlob = document.getElementById("title-blob");
const requestDetailContainer = document.getElementById("request-details");
const requestLiteContainer = document.getElementById("request-lite");
const requestHeadersContainer = document.getElementById("request-headers");

//TODO will make this dynamic later, like to loop and display in order of history but for now lets just display the two of them for the mock but also ++ add pagination    

// get the data from /hello route and put it in innerHTML


fetch("/hello")
    .then((response) => response.json())
    .then((data) => {
        const parsedDataOne = JSON.parse(data[0].data);
        const parsedDataTwo = JSON.parse(data[1].data);

        // console.log(parsedDataOne.request);

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
            obj === parsedDataOne.request.headers ? requestHeadersContainer.appendChild(pre) : requestDetailContainer.appendChild(pre);
        }

        handleNested(parsedDataOne.request.body);
        handleNested(parsedDataOne.request.headers);

    }).catch((error) => {
        console.log(error);
    })