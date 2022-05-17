console.log("Sanity now");


const searchInput = document.getElementById("blobSearchValue");
const searchParam = document.getElementById("blobSearchParam");
const clearButton = document.getElementById("clearBlobBtn");
let blobs = [];

const searchBlobs = (e) => {
    const text = e.target.value.toLowerCase();
    const searchValue = searchParam.value.toLowerCase();
    console.log(searchValue) // debug
    document.querySelectorAll(".blob-wrapper").forEach((blob) => {
        // TODO add search by RULE (or request-keyword)
        // also there is a more dynamic way to do this i know
        let blobIdentifier;
        
        if (searchValue === "guid") {
            blobIdentifier = blob.querySelector(".blob-guid-wrapper").innerText;
        } else if (searchValue === "url") {
            blobIdentifier = blob.querySelector(".blob-url-wrapper").innerText;
        } else if (searchValue === "method") {
            blobIdentifier = blob.querySelector(".blob-method-wrapper").innerText;
        } else if (searchValue === "statuscode") {
            blobIdentifier = blob.querySelector(".blob-status-wrapper").innerText;
        } else {
            console.log("Something went wrong grabbing a param to search");
        }

        if (blobIdentifier.toLowerCase().indexOf(text) != -1) {
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