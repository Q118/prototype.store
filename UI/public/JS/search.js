console.log("Sanity now");

const searchInput = document.getElementById("searchValueField");

let blobs = [];

const searchBlobs = (e) => {
    const text = e.target.value.toLowerCase();

    //iterate over the whole list and store the names of the items in it
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

