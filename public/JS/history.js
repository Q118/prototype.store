console.log("hello");

/**
 * @summary this file to bring in the blob data from the /hello route parse and display to front end
 */

const historyContainer = document.getElementById("history-container");
const titleBlob = document.getElementById("title-blob");
const requestDetailContainer = document.getElementById("request-details");
const requestLiteContainer = document.getElementById("request-lite");

// get the data from /hello route and put it in innerHTML
fetch("/hello")
    .then((response) => response.json())
    .then((data) => {
        //console.log(JSON.parse(data[0].data));
        const parsedDataOne = JSON.parse(data[0].data);
        const parsedDataTwo = JSON.parse(data[1].data);
        console.log(parsedDataOne.request);
        titleBlob.innerHTML = data[0].name.replace(".json", "");

        for (const [key, value]
            of Object.entries(parsedDataOne.request)) {
            if (key === "body") {
                continue;
            }
            const div = document.createElement("div");
            div.innerHTML = `${key}: ${value}`;
            requestLiteContainer.appendChild(div);
        }

        const pre = document.createElement("pre");
        pre.innerHTML = JSON.stringify(parsedDataOne.request.body.data, undefined, 2);
        requestDetailContainer.appendChild(pre);


        // for (const [key, value] of Object.entries(data[0])) {
        //     const div = document.createElement("div");
        //     div.innerHTML = `${key}: ${value}`;
        //     historyContainer.appendChild(div);
        // }
        //TODO will make this dynamic later, like to loop and display in order of history but for now lets just display the two of them for the mock but also ++ add pagination    




        // historyContainer.innerHTML = data;
    }).catch((error) => {
        console.log(error);
    })