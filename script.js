function checkForNewColumn(cell, day) {
    const headerRow = document.getElementById(`header-row-${day}`);
    const headers = headerRow.querySelectorAll("th");
    const lastHeader = headers[headers.length - 1];

    if (cell === lastHeader && cell.innerText.trim() !== "") {
        const newHeader = document.createElement("th");
        newHeader.setAttribute("contenteditable", "true");
        newHeader.setAttribute("oninput", `checkForNewColumn(this, '${day}')`);
        headerRow.appendChild(newHeader);

        const bodyRows = document.querySelectorAll(`#schedule-body-${day} tr`);
        for (let row of bodyRows) {
            const newCell = document.createElement("td");
            newCell.setAttribute("contenteditable", "true");
            newCell.setAttribute("oninput", "updateFreeTime(this)");
            row.appendChild(newCell);
        }
    }
}

function updateFreeTime(cell) {
    const row = cell.parentElement;
    const editableCells = Array.from(row.querySelectorAll('td[contenteditable="true"]'));
    const hasContent = editableCells.some(c => c.innerText.trim() !== "");
    const freeTimeCell = row.querySelector('.free-time-cell');

    if (freeTimeCell) {
        freeTimeCell.innerText = hasContent ? "No" : "Yes";
    }
}

function saveAllTables() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const allData = {};

    days.forEach(day => {
        const table = document.querySelector(`table[data-day='${day}']`);
        const headers = table.querySelectorAll('thead th');
        const people = [];

        for (let i = 2; i < headers.length; i++) {  // Skip Time and Free Time
            people.push(headers[i].innerText.trim());
        }

        const rows = table.querySelectorAll('tbody tr');
        const schedule = [];

        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            const rowData = [];
            for (let i = 1; i < cells.length; i++) {  // Start from 1 to skip Time
                rowData.push(cells[i].innerText.trim());
            }
            schedule.push(rowData);
        }

        allData[day] = {
            people: people,
            schedule: schedule
        };
    });

    fetch('/update_all_days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allData)
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('status').innerText = 'All schedules saved!';

        // Popup asking if user wants to download the saved file
        if (confirm('Schedules saved! Do you want to download the freeTime.txt file?')) {
            const a = document.createElement('a');
            a.href = '/download_free_time';
            a.download = 'freeTime.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    })
    .catch(err => {
        document.getElementById('status').innerText = 'Error saving schedules.';
    });
}
