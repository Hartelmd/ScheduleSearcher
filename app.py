from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)

# Initial empty one-column schedule
initial_people = [""]

def generate_times():
    start = datetime.strptime("06:00", "%H:%M")
    end = datetime.strptime("20:00", "%H:%M")
    times = []
    while start <= end:
        times.append(start.strftime("%I:%M %p"))
        start += timedelta(minutes=30)
    return times

time_slots = generate_times()
schedule = [[ "" ] for _ in time_slots]

@app.route('/')
def index():
    return render_template("index.html", people=initial_people, time_slots=time_slots, schedule=schedule)

@app.route('/update_all_days', methods=['POST'])
def update_all_days():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400

    try:
        with open("freeTime.txt", "w") as f:
            for day, content in data.items():
                f.write(f"=== {day} ===\n")

                people = content.get('people', [])
                # Define column widths (adjust as needed)
                time_col_width = 10
                free_time_col_width = 10
                person_col_width = 15

                # Write header line with padding
                header = (
                    "Time".ljust(time_col_width) + " | " +
                    "Free Time".ljust(free_time_col_width) + " | " +
                    " | ".join(p.ljust(person_col_width) for p in people)
                )
                f.write(header + "\n")

                # Write separator line
                total_width = (
                    time_col_width + free_time_col_width + 
                    len(people) * (person_col_width + 3) - 3  # subtract last separator
                )
                f.write("-" * total_width + "\n")

                schedule = content.get('schedule', [])
                for i, row in enumerate(schedule):
                    time_str = time_slots[i].ljust(time_col_width)
                    free_time_str = row[0].ljust(free_time_col_width) if len(row) > 0 else "Yes".ljust(free_time_col_width)
                    # Pad person cells; if missing, fill with spaces
                    person_cells = [c.ljust(person_col_width) for c in row[1:]]
                    # If fewer person cells than people, pad empty cells
                    if len(person_cells) < len(people):
                        person_cells += [" " * person_col_width] * (len(people) - len(person_cells))

                    line = time_str + " | " + free_time_str + " | " + " | ".join(person_cells)
                    f.write(line + "\n")

                f.write("\n")
        return jsonify({'status': 'success', 'message': 'Saved to freeTime.txt'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
