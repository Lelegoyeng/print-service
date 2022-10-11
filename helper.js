const formatDateOnly = (date) => {
  let dateObj = Date.parse(date);

  if (!dateObj) {
    dateObj = new Date(Date.now());
  }

  return new Intl.DateTimeFormat("id", {
    day: "numeric",
    month: 'numeric',
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  }).format(dateObj);
}

module.exports = {formatDateOnly};