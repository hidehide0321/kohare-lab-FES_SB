
const HEADERS = [
  "タイムスタンプ",
  "郵便番号",
  "来場人数",
  "子供の人数",
  "子供1の学年",
  "子供2の学年",
  "子供3の学年",
  "子供4の学年",
  "子供5の学年",
  "子供6の学年",
  "子供7の学年"
];

function setup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getRange(1, 1).getValue() !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function doPost(e) {
  try {
    setup(); // ヘッダーがなければ作成
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    const newRow = [
      new Date(),
      data.postalCode || '',
      data.adults || '',
      data.childrenCount || ''
    ];

    const maxChildren = 7;
    for (let i = 0; i < maxChildren; i++) {
      newRow.push(data.childrenGrades[i] || '');
    }

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
