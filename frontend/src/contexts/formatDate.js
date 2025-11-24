// formatDate.js
// Hàm lấy ISO Week
function getISOWeek(date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

const formatDate = {
  // Fill tuần còn thiếu trong tháng
  fillMissingWeeksOfMonth: (data = [], year, month) => {
    const filled = [];
    const weeksOfMonth = new Set();

    // Lấy tất cả ngày của tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const weekNumber = getISOWeek(date);
      weeksOfMonth.add(weekNumber);
    }

    const weeksSorted = Array.from(weeksOfMonth).sort((a, b) => a - b);

    weeksSorted.forEach((week) => {
      const weekStr = `${year}-${String(week).padStart(2, "0")}`;
      const existing = data.find((item) => item.date === weekStr);

      filled.push(
        existing || {
          date: weekStr,
          revenue: 0,
          orders: 0,
        }
      );
    });

    return filled;
  },

  // Fill tháng còn thiếu trong năm
  fillMissingMonths: (data = [], year) => {
    const filled = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${String(month).padStart(2, "0")}`;
      const existing = data.find((item) => item.date === monthStr);

      filled.push(
        existing || {
          date: monthStr,
          revenue: 0,
          orders: 0,
        }
      );
    }

    return filled.sort((a, b) => a.date.localeCompare(b.date));
  },

  // Format label tuần/tháng để hiển thị
  formatLabel: (dateStr, type) => {
    const [year, num] = dateStr.split("-");
    if (type === "week") return `Tuần ${parseInt(num)} / T${new Date(year, 0).getMonth() + 1}`;
    if (type === "month") return `Tháng ${parseInt(num)}`;
    return dateStr;
  },



};

export default formatDate;
