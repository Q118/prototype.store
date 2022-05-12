console.log("Sanity now");

//TODO can delete the search/clear buttons as the results are rendered by input

const searchInput = document.getElementById("blobSearchValue");
const searchParam = document.getElementById("blobSearchParam");

let blobs = [];

const searchBlobs = (e) => {
    const text = e.target.value.toLowerCase();


    console.log(searchParam.value)

    document.querySelectorAll(".blob-wrapper").forEach((blob) => {
        const blobName = blob.querySelector("#title-blob").innerText;
        if (blobName.toLowerCase().indexOf(text) != -1) {
            blob.style.display = "block";
        } else {
            blob.style.display = "none";
        }
    });
}

searchInput.addEventListener("keyup", searchBlobs);

