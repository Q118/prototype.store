let coll = document.getElementsByClassName("collapsible");
let i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        let content = this.nextElementSibling;

        console.log(this.children)
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        } //TODO add logic here so it only opens the next child but not the next next child
    });
}