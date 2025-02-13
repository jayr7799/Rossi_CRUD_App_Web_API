const itemContainer = document.getElementById("users-container");

const fetchUsers = async()=>{
    try
    {
        const response = await fetch("/videoGames");
        if(!response.ok)
        {
            throw new Error("Failed to get Items");
        }
        //parse json
        const items = await response.json();
        //format data to html
        itemContainer.innerHTML = "";
        items.forEach((item) => {
            const itemDiv = document.createElement("div");
            const updateButton = document.createElement("button");
            const deleteButton = document.createElement("button");
            itemDiv.className = "item";
            itemDiv.innerHTML = `<br>Game Title: ${item.GameName}<br> Publisher: ${item.Publisher}<br> Developer: ${item.Developer}`;
            updateButton.data = item.GameName;
            updateButton.innerHTML = 'Update';
            deleteButton.data = item.GameName;
            deleteButton.innerHTML = 'Delete';
            updateButton.onclick = function()
            {
                window.location.href = `update.html?id=${item._id}&GameName=${item.GameName}&Publisher=${item.Publisher}&Developer=${item.Developer}`;               
            }
            deleteButton.onclick = async function()
            {
                const response = await fetch(`/deleteItem/GameName?GameName=${item.GameName}`, {
                    method: 'DELETE',
                });
                const mes = await response.json();
                alert(mes.message);
                window.location.href = '/users.html';
            }
            itemContainer.appendChild(itemDiv);
            itemContainer.appendChild(updateButton);
            itemContainer.appendChild(deleteButton);
        });
    }
    catch(error)
    {
        console.error("Error: ", error);
        itemContainer.innerHTML = "<p style='color:red'>Failed to get items</p>"
    }
};

fetchUsers();