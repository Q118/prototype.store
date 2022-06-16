// serverTiming: "totl;dur=8.2517, vald;dur=0.0771, proc;dur=8.1538, xfrm;dur=0.0095ms"
//parse the above string to get the value of totl;dur=

const aderantServerTiming = "totl;dur=8.2517, vald;dur=0.0771, proc;dur=8.1538, xfrm;dur=0.0095ms"

let serverTiming = aderantServerTiming;

let timingArr = serverTiming.split(", ");
serverTiming = timingArr[0].split("=")[1];


console.log(timingArr);
console.log(serverTiming);

let msgObj = {
    "requestId": "f90efe55-8c24-4ac8-911f-a5b124fedf15",
    "step": "result",
    "serverTiming": "6.7874ms",
    "statusCode": 200
}