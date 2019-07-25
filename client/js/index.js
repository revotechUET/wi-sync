function reloadUserList() {
    let e = document.getElementById("listUser");
    let req = new XMLHttpRequest();
    req.onload = function(res) {

    };
    req.open('open', 'localhost:3034/user/getlist');
    req.send();
}