const searchInput = document.getElementById("blobSearchValue");
const searchParam = document.getElementById("blobSearchParam");
const clearButton = document.getElementById("clearBlobBtn");
let blobs = [];

const searchBlobs = (e) => {
    const text = e.target.value.toLowerCase();
    const searchValue = searchParam.value.toLowerCase();
    console.log(searchValue) // debug
    document.querySelectorAll(".blob-wrapper").forEach((blob) => {
        //? there is a more dynamic way to do this.
        let blobIdentifier;
        switch(searchValue) {
            case "guid": blobIdentifier = blob.querySelector(".blob-guid-wrapper").innerText; break;
            case "url": blobIdentifier = blob.querySelector(".blob-url-wrapper").innerText; break;
            case "method": blobIdentifier = blob.querySelector(".blob-method-wrapper").innerText; break;
            case "statuscode": blobIdentifier = blob.querySelector(".blob-status-wrapper").innerText; break;
            case "reqkeyword": blobIdentifier = blob.querySelector("#blob-request-body").innerText; break;
            case "reskeyword": blobIdentifier = blob.querySelector("#blob-response-body").innerText; break;
            default: console.log("Something went wrong grabbing a param to search");
        }

        if (blobIdentifier?.toLowerCase().indexOf(text) != -1) { // -1 = not found ;-)
            blob.style.display = "block";
        } else {
            blob.style.display = "none";
        }
    });
}

searchInput.addEventListener("keyup", searchBlobs);

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchBlobs({ target: searchInput });
});