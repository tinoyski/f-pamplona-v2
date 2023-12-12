import jsPDF from "jspdf";

interface pdfProps {
  returnJsPDFDocObject?: boolean;
  fileName: string;
  orientationLandscape?: boolean;
  compress?: boolean;
  logo?: {
    src?: string;
    type?: string;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      left?: number;
    };
  };
  stamp?: {
    inAllPages?: boolean;
    src?: string;
    type?: string;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      left?: number;
    };
  };
  business?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    email_1?: string;
    website?: string;
  };
  contact?: {
    label?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    otherInfo?: string;
  };
  invoice?: {
    label?: string;
    num?: number;
    invDate?: string;
    invGenDate?: string;
    headerBorder?: boolean;
    tableBodyBorder?: boolean;
    header?: {
      title: string;
      style?: {
        width?: number;
      };
    }[];
    table?: any;
    invDescLabel?: string;
    invDesc?: string;
    additionalRows?: {
      col1?: string;
      col2?: string;
      col3?: string;
      style?: {
        fontSize?: number;
      };
    }[];
  };
  footer?: {
    text?: string;
  };
  pageEnable?: boolean;
  pageLabel?: string;
}

/**
 * Formats a number into a string representation of the number in PHP currency format.
 *
 * @param {number} number - The number to be formatted.
 * @return {string} The formatted number as a string.
 */
export function dataFormatter(number: number): string {
  return Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(number);
}

export function jsPDFInvoiceTemplate(props: pdfProps) {
  const param = {
    returnJsPDFDocObject: props.returnJsPDFDocObject || false,
    fileName: props.fileName || "",
    orientationLandscape: props.orientationLandscape || false,
    compress: props.compress || false,
    logo: {
      src: props.logo?.src || "",
      type: props.logo?.type || "",
      width: props.logo?.width || 0,
      height: props.logo?.height || 0,
      margin: {
        top: props.logo?.margin?.top || 0,
        left: props.logo?.margin?.left || 0,
      },
    },
    stamp: {
      inAllPages: props.stamp?.inAllPages || false,
      src: props.stamp?.src || "",
      type: props.logo?.type || "",
      width: props.stamp?.width || 0,
      height: props.stamp?.height || 0,
      margin: {
        top: props.stamp?.margin?.top || 0,
        left: props.stamp?.margin?.left || 0,
      },
    },
    business: {
      name: props.business?.name || "",
      address: props.business?.address || "",
      phone: props.business?.phone || "",
      email: props.business?.email || "",
      email_1: props.business?.email_1 || "",
      website: props.business?.website || "",
    },
    contact: {
      label: props.contact?.label || "",
      name: props.contact?.name || "",
      address: props.contact?.address || "",
      phone: props.contact?.phone || "",
      email: props.contact?.email || "",
      otherInfo: props.contact?.otherInfo || "",
    },
    invoice: {
      label: props.invoice?.label || "",
      num: props.invoice?.num || "",
      invDate: props.invoice?.invDate || "",
      invGenDate: props.invoice?.invGenDate || "",
      headerBorder: props.invoice?.headerBorder || false,
      tableBodyBorder: props.invoice?.tableBodyBorder || false,
      header: props.invoice?.header || [],
      table: props.invoice?.table || [],
      invDescLabel: props.invoice?.invDescLabel || "",
      invDesc: props.invoice?.invDesc || "",
      additionalRows: props.invoice?.additionalRows?.map((x) => {
        return {
          col1: x?.col1 || "",
          col2: x?.col2 || "",
          col3: x?.col3 || "",
          style: {
            fontSize: x?.style?.fontSize || 12,
          },
        };
      }),
    },
    footer: {
      text: props.footer?.text || "",
    },
    pageEnable: props.pageEnable || false,
    pageLabel: props.pageLabel || "Page",
  };

  const splitTextAndGetHeight = (text: string, size: number) => {
    let lines = doc.splitTextToSize(text, size);
    return {
      text: lines,
      height: doc.getTextDimensions(lines).h,
    };
  };
  if (param.invoice.table && param.invoice.table.length) {
    if (param.invoice.table[0].length != param.invoice.header.length)
      throw Error("Length of header and table column must be equal.");
  }

  let doc = new jsPDF({
    orientation: param.orientationLandscape ? "l" : "p",
    compress: param.compress,
  });

  let docWidth = doc.internal.pageSize.width;
  let docHeight = doc.internal.pageSize.height;

  let colorBlack = "#000000";
  let colorGray = "#4d4e53";
  //starting at 15mm
  let currentHeight = 15;
  //let startPointRectPanel1 = currentHeight + 6;

  let pdfConfig = {
    headerTextSize: 20,
    labelTextSize: 12,
    fieldTextSize: 10,
    lineHeight: 6,
    subLineHeight: 4,
  };

  doc.setFontSize(pdfConfig.headerTextSize);
  doc.setTextColor(colorBlack);
  doc.text(param.business.name, docWidth - 10, currentHeight, {
    align: "right",
  });
  doc.setFontSize(pdfConfig.fieldTextSize);

  if (param.logo.src) {
    let imageHeader: string | HTMLImageElement;
    if (typeof window === "undefined") {
      imageHeader = param.logo.src;
    } else {
      imageHeader = new Image();
      imageHeader.src = param.logo.src;
    }
    //doc.text(htmlDoc.sessionDateText, docWidth - (doc.getTextWidth(htmlDoc.sessionDateText) + 10), currentHeight);
    if (param.logo.type)
      doc.addImage(
        imageHeader,
        param.logo.type,
        10 + param.logo.margin.left,
        currentHeight - 5 + param.logo.margin.top,
        param.logo.width,
        param.logo.height
      );
    else
      doc.addImage(
        imageHeader,
        10 + param.logo.margin.left,
        currentHeight - 5 + param.logo.margin.top,
        param.logo.width,
        param.logo.height
      );
  }

  doc.setTextColor(colorGray);

  currentHeight += pdfConfig.subLineHeight;
  currentHeight += pdfConfig.subLineHeight;
  currentHeight += pdfConfig.subLineHeight + 2;
  doc.text(param.business.address, docWidth - 10, currentHeight, {
    align: "right",
  });
  currentHeight += pdfConfig.subLineHeight;
  doc.text(param.business.phone, docWidth - 10, currentHeight, {
    align: "right",
  });
  doc.setFontSize(pdfConfig.fieldTextSize);
  // doc.setTextColor(colorGray);
  currentHeight += pdfConfig.subLineHeight;
  doc.text(param.business.email, docWidth - 10, currentHeight, {
    align: "right",
  });

  currentHeight += pdfConfig.subLineHeight;
  doc.text(param.business.email_1, docWidth - 10, currentHeight, {
    align: "right",
  });

  // currentHeight += pdfConfig.subLineHeight;
  doc.text(param.business.website, docWidth - 10, currentHeight, {
    align: "right",
  });

  //line breaker after logo & business info
  if (param.invoice.header.length) {
    currentHeight += pdfConfig.subLineHeight;
    doc.line(10, currentHeight, docWidth - 10, currentHeight);
  }

  //Contact part
  doc.setTextColor(colorGray);
  doc.setFontSize(pdfConfig.fieldTextSize);
  currentHeight += pdfConfig.lineHeight;
  if (param.contact.label) {
    doc.text(param.contact.label, 10, currentHeight);
    currentHeight += pdfConfig.lineHeight;
  }

  doc.setTextColor(colorBlack);
  doc.setFontSize(pdfConfig.headerTextSize - 5);
  if (param.contact.name) doc.text(param.contact.name, 10, currentHeight);

  if (param.invoice.label && param.invoice.num) {
    doc.text(
      param.invoice.label + param.invoice.num,
      docWidth - 10,
      currentHeight,
      { align: "right" }
    );
  }

  if (param.contact.name || (param.invoice.label && param.invoice.num))
    currentHeight += pdfConfig.subLineHeight;

  doc.setTextColor(colorGray);
  doc.setFontSize(pdfConfig.fieldTextSize - 2);

  if (param.contact.address || param.invoice.invDate) {
    doc.text(param.contact.address, 10, currentHeight);
    doc.text(param.invoice.invDate, docWidth - 10, currentHeight, {
      align: "right",
    });
    currentHeight += pdfConfig.subLineHeight;
  }

  if (param.contact.phone || param.invoice.invGenDate) {
    doc.text(param.contact.phone, 10, currentHeight);
    doc.text(param.invoice.invGenDate, docWidth - 10, currentHeight, {
      align: "right",
    });
    currentHeight += pdfConfig.subLineHeight;
  }

  if (param.contact.email) {
    doc.text(param.contact.email, 10, currentHeight);
    currentHeight += pdfConfig.subLineHeight;
  }

  if (param.contact.otherInfo)
    doc.text(param.contact.otherInfo, 10, currentHeight);
  else currentHeight -= pdfConfig.subLineHeight;
  //end contact part

  //TABLE PART
  //let tdWidth = 31.66;
  //10 margin left - 10 margin right
  let tdWidth =
    (doc.internal.pageSize.getWidth() - 20) / param.invoice.header.length;

  //#region TD WIDTH
  if (param.invoice.header.length > 2) {
    //add style for 2 or more columns
    const customColumnNo = param.invoice.header
      .map((x) => x?.style?.width || 0)
      .filter((x) => x > 0);
    let customWidthOfAllColumns = customColumnNo.reduce((a, b) => a + b, 0);
    tdWidth =
      (doc.internal.pageSize.getWidth() - 20 - customWidthOfAllColumns) /
      (param.invoice.header.length - customColumnNo.length);
  }
  //#endregion

  //#region TABLE HEADER BORDER
  let addTableHeaderBorder = () => {
    currentHeight += 2;
    const lineHeight = 7;
    let startWidth = 0;
    for (let i = 0; i < param.invoice.header.length; i++) {
      const currentTdWidth = param.invoice.header[i]?.style?.width || tdWidth;
      if (i === 0) doc.rect(10, currentHeight, currentTdWidth, lineHeight);
      else {
        const previousTdWidth =
          param.invoice.header[i - 1]?.style?.width || tdWidth;
        const widthToUse =
          currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.rect(startWidth + 10, currentHeight, currentTdWidth, lineHeight);
      }
    }
    currentHeight -= 2;
  };
  //#endregion

  //#region TABLE BODY BORDER
  let addTableBodyBorder = (lineHeight: number) => {
    let startWidth = 0;
    for (let i = 0; i < param.invoice.header.length; i++) {
      const currentTdWidth = param.invoice.header[i]?.style?.width || tdWidth;
      if (i === 0) doc.rect(10, currentHeight, currentTdWidth, lineHeight);
      else {
        const previousTdWidth =
          param.invoice.header[i - 1]?.style?.width || tdWidth;
        const widthToUse =
          currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.rect(startWidth + 10, currentHeight, currentTdWidth, lineHeight);
      }
    }
  };
  //#endregion

  //#region TABLE HEADER
  let addTableHeader = () => {
    if (param.invoice.headerBorder) addTableHeaderBorder();

    currentHeight += pdfConfig.subLineHeight;
    doc.setTextColor(colorBlack);
    doc.setFontSize(pdfConfig.fieldTextSize);
    //border color
    doc.setDrawColor(colorGray);
    currentHeight += 2;

    let startWidth = 0;
    param.invoice.header.forEach(function (row, index) {
      if (index == 0) doc.text(row.title, 11, currentHeight);
      else {
        const currentTdWidth = row?.style?.width || tdWidth;
        const previousTdWidth =
          param.invoice.header[index - 1]?.style?.width || tdWidth;
        const widthToUse =
          currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.text(row.title, startWidth + 11, currentHeight);
      }
    });

    currentHeight += pdfConfig.subLineHeight - 1;
    doc.setTextColor(colorGray);
  };
  //#endregion

  addTableHeader();

  //#region TABLE BODY
  let tableBodyLength = param.invoice.table.length;
  param.invoice.table.forEach((row: any[], index: number) => {
    doc.line(10, currentHeight, docWidth - 10, currentHeight);

    //get nax height for the current row
    let getRowsHeight = function () {
      let rowsHeight: any[] = [];
      row.forEach(function (rr, index) {
        const widthToUse = param.invoice.header[index]?.style?.width || tdWidth;

        let item = splitTextAndGetHeight(rr.toString(), widthToUse - 1); //minus 1, to fix the padding issue between borders
        rowsHeight.push(item.height);
      });

      return rowsHeight;
    };

    let maxHeight = Math.max(...getRowsHeight());

    //body borders
    if (param.invoice.tableBodyBorder) addTableBodyBorder(maxHeight + 1);

    let startWidth = 0;
    row.forEach(function (rr, index) {
      const widthToUse = param.invoice.header[index]?.style?.width || tdWidth;
      let item = splitTextAndGetHeight(rr.toString(), widthToUse - 1); //minus 1, to fix the padding issue between borders

      if (index == 0) doc.text(item.text, 11, currentHeight + 4);
      else {
        const currentTdWidth = rr?.style?.width || tdWidth;
        const previousTdWidth =
          param.invoice.header[index - 1]?.style?.width || tdWidth;
        const widthToUse =
          currentTdWidth == previousTdWidth ? currentTdWidth : previousTdWidth;
        startWidth += widthToUse;
        doc.text(item.text, 11 + startWidth, currentHeight + 4);
      }
    });

    currentHeight += maxHeight - 4;

    //td border height
    currentHeight += 5;

    //pre-increase currentHeight to check the height based on next row
    if (index + 1 < tableBodyLength) currentHeight += maxHeight;

    if (
      param.orientationLandscape &&
      (currentHeight > 185 ||
        (currentHeight > 178 && doc.getNumberOfPages() > 1))
    ) {
      doc.addPage();
      currentHeight = 10;
      if (index + 1 < tableBodyLength) addTableHeader();
    }

    if (
      !param.orientationLandscape &&
      (currentHeight > 265 ||
        (currentHeight > 255 && doc.getNumberOfPages() > 1))
    ) {
      doc.addPage();
      currentHeight = 10;
      if (index + 1 < tableBodyLength) addTableHeader();
      //else
      //currentHeight += pdfConfig.subLineHeight + 2 + pdfConfig.subLineHeight - 1; //same as in addtableHeader
    }

    //reset the height that was increased to check the next row
    if (index + 1 < tableBodyLength && currentHeight > 30)
      // check if new page
      currentHeight -= maxHeight;
  });
  //doc.line(10, currentHeight, docWidth - 10, currentHeight); //if we want to show the last table line
  //#endregion

  let invDescSize = splitTextAndGetHeight(
    param.invoice.invDesc,
    docWidth / 2
  ).height;

  //#region PAGE BREAKER
  let checkAndAddPageLandscape = function () {
    if (!param.orientationLandscape && currentHeight + invDescSize > 270) {
      doc.addPage();
      currentHeight = 10;
    }
  };

  let checkAndAddPageNotLandscape = function (heightLimit = 173) {
    if (
      param.orientationLandscape &&
      currentHeight + invDescSize > heightLimit
    ) {
      doc.addPage();
      currentHeight = 10;
    }
  };
  let checkAndAddPage = function () {
    checkAndAddPageNotLandscape();
    checkAndAddPageLandscape();
  };
  //#endregion

  //#region Stamp
  let addStamp = () => {
    let _addStampBase = () => {
      let stampImage: string | HTMLImageElement;
      if (typeof window === "undefined") {
        stampImage = param.stamp.src;
      } else {
        stampImage = new Image();
        stampImage.src = param.stamp.src;
      }

      if (param.stamp.type)
        doc.addImage(
          stampImage,
          param.stamp.type,
          10 + param.stamp.margin.left,
          docHeight - 22 + param.stamp.margin.top,
          param.stamp.width,
          param.stamp.height
        );
      else
        doc.addImage(
          stampImage,
          10 + param.stamp.margin.left,
          docHeight - 22 + param.stamp.margin.top,
          param.stamp.width,
          param.stamp.height
        );
    };

    if (param.stamp.src) {
      if (param.stamp.inAllPages) _addStampBase();
      else if (
        !param.stamp.inAllPages &&
        doc.getCurrentPageInfo().pageNumber == doc.getNumberOfPages()
      )
        _addStampBase();
    }
  };
  //#endregion

  checkAndAddPage();

  doc.setTextColor(colorBlack);
  doc.setFontSize(pdfConfig.labelTextSize);
  currentHeight += pdfConfig.lineHeight;

  //#region additionalRows
  if (
    param.invoice.additionalRows &&
    param.invoice.additionalRows?.length > 0
  ) {
    //#region Line breaker before invoce total
    doc.line(docWidth / 2, currentHeight, docWidth - 10, currentHeight);
    currentHeight += pdfConfig.lineHeight;
    //#endregion

    for (let i = 0; i < param.invoice.additionalRows.length; i++) {
      currentHeight += pdfConfig.lineHeight;
      doc.setFontSize(param.invoice.additionalRows[i].style.fontSize);

      doc.text(
        param.invoice.additionalRows[i].col1,
        docWidth / 1.5,
        currentHeight,
        { align: "right" }
      );
      doc.text(
        param.invoice.additionalRows[i].col2,
        docWidth - 25,
        currentHeight,
        { align: "right" }
      );
      doc.text(
        param.invoice.additionalRows[i].col3,
        docWidth - 10,
        currentHeight,
        { align: "right" }
      );
      checkAndAddPage();
    }
  }
  //#endregion

  checkAndAddPage();

  doc.setTextColor(colorBlack);
  currentHeight += pdfConfig.subLineHeight;
  currentHeight += pdfConfig.subLineHeight;
  //   currentHeight += pdfConfig.subLineHeight;
  doc.setFontSize(pdfConfig.labelTextSize);

  //#region Add num of pages at the bottom
  if (doc.getNumberOfPages() > 1) {
    for (let i = 1; i <= doc.getNumberOfPages(); i++) {
      doc.setFontSize(pdfConfig.fieldTextSize - 2);
      doc.setTextColor(colorGray);

      if (param.pageEnable) {
        doc.text(param.footer.text, docWidth / 2, docHeight - 10, {
          align: "center",
        });
        doc.setPage(i);
        doc.text(
          param.pageLabel + " " + i + " / " + doc.getNumberOfPages(),
          docWidth - 20,
          doc.internal.pageSize.height - 6
        );
      }

      checkAndAddPageNotLandscape(183);
      checkAndAddPageLandscape();
      addStamp();
    }
  }
  //#endregion

  //#region INVOICE DESCRIPTION
  let addInvoiceDesc = () => {
    doc.setFontSize(pdfConfig.labelTextSize);
    doc.setTextColor(colorBlack);

    doc.text(param.invoice.invDescLabel, 10, currentHeight);
    currentHeight += pdfConfig.subLineHeight;
    doc.setTextColor(colorGray);
    doc.setFontSize(pdfConfig.fieldTextSize - 1);

    let lines = doc.splitTextToSize(param.invoice.invDesc, docWidth / 2);
    //text in left half
    doc.text(lines, 10, currentHeight);
    currentHeight +=
      doc.getTextDimensions(lines).h > 5
        ? doc.getTextDimensions(lines).h + 6
        : pdfConfig.lineHeight;

    return currentHeight;
  };
  addInvoiceDesc();
  //#endregion

  addStamp();

  //#region Add num of first page at the bottom
  if (doc.getNumberOfPages() === 1 && param.pageEnable) {
    doc.setFontSize(pdfConfig.fieldTextSize - 2);
    doc.setTextColor(colorGray);
    doc.text(param.footer.text, docWidth / 2, docHeight - 10, {
      align: "center",
    });
    doc.text(
      param.pageLabel + "1 / 1",
      docWidth - 20,
      doc.internal.pageSize.height - 6
    );
  }
  //#endregion

  let returnObj = {
    pagesNumber: doc.getNumberOfPages(),
    doc,
  };

  return returnObj;
}
