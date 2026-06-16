(function() {
    const name = localStorage.getItem("userName") || "Faculty";
    const email = localStorage.getItem("userEmail") || "";
    const userId = localStorage.getItem("userId") || "";
    const role = localStorage.getItem("userRole") || "faculty";

    const sidebarName = document.getElementById("facSidebarName") || document.getElementById("facultyName");
    const sidebarDept = document.getElementById("facSidebarDept") || document.getElementById("facultyDept");
    const sidebarId = document.getElementById("facSidebarId");

    if (sidebarName) sidebarName.textContent = name;
    if (sidebarDept) sidebarDept.textContent = email || role;
    if (sidebarId) sidebarId.textContent = userId.slice(0, 8) || "--";

    const welcome = document.getElementById("welcomeMessage");
    if (welcome) welcome.textContent = `Welcome back, ${name.split(" ")[0]}. Here is your event overview.`;
})();
