import path from "path";

const getInvoice = async () => {
  const { Page, Text, View, Document, StyleSheet, Image, Font } = await import(
    "@react-pdf/renderer"
  );

  // Register fonts
  Font.register({
    family: "Outfit",
    fonts: [
      { src: path.join(__dirname, "..", "fonts", "Outfit-Regular.ttf") },
      {
        src: path.join(__dirname, "..", "fonts", "Outfit-Bold.ttf"),
        fontWeight: "bold",
      },
      {
        src: path.join(__dirname, "..", "fonts", "Outfit-SemiBold.ttf"),
        fontWeight: "semibold",
      },
    ],
  });

  // Create styles
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      padding: 30,
      fontFamily: "Outfit",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 30,
      borderBottom: 2,
      borderBottomColor: "#166434",
      paddingBottom: 20,
    },
    companyInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#166434",
      marginBottom: 5,
    },
    companyDetails: {
      fontSize: 10,
      color: "#6B7280",
      lineHeight: 1.4,
    },
    invoiceInfo: {
      alignItems: "flex-end",
    },
    invoiceTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1F2937",
      marginBottom: 10,
    },
    invoiceDetails: {
      fontSize: 10,
      color: "#6B7280",
      lineHeight: 1.4,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#1F2937",
      marginBottom: 10,
      borderBottom: 1,
      borderBottomColor: "#E5E7EB",
      paddingBottom: 5,
    },
    customerInfo: {
      backgroundColor: "#F9FAFB",
      padding: 15,
      borderRadius: 4,
    },
    customerText: {
      fontSize: 10,
      color: "#374151",
      lineHeight: 1.4,
    },
    table: {
      marginTop: 10,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#166434",
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    tableHeaderText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "bold",
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: 1,
      borderBottomColor: "#E5E7EB",
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    tableCell: {
      fontSize: 9,
      color: "#374151",
    },
    col1: { flex: 2 },
    col2: { flex: 2 },
    col3: { flex: 1, textAlign: "center" },
    col4: { flex: 1, textAlign: "center" },
    col5: { flex: 1.5, textAlign: "right" },
    totalsSection: {
      marginTop: 20,
      alignItems: "flex-end",
    },
    totalsTable: {
      width: 250,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    totalLabel: {
      fontSize: 10,
      color: "#6B7280",
    },
    totalValue: {
      fontSize: 10,
      color: "#374151",
      fontWeight: "bold",
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: "#166434",
      marginTop: 5,
    },
    grandTotalLabel: {
      fontSize: 12,
      color: "#ffffff",
      fontWeight: "bold",
    },
    grandTotalValue: {
      fontSize: 12,
      color: "#ffffff",
      fontWeight: "bold",
    },
    footer: {
      marginTop: 30,
      paddingTop: 20,
      borderTop: 1,
      borderTopColor: "#E5E7EB",
    },
    termsTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#1F2937",
      marginBottom: 10,
    },
    termsText: {
      fontSize: 9,
      color: "#6B7280",
      lineHeight: 1.4,
    },
  });

  // Main Document Component
  const InvoiceDocument = ({ invoiceData }) => {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>MinCykel</Text>
              <Text style={styles.companyDetails}>
                Stockholmsgatan 123, 111 11 Stockholm{"\n"}
                Phone: +46 70 123 45 67{"\n"}
                Email: rentals@mincykel.se{"\n"}
                www.mincykel.se
              </Text>
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceDetails}>
                Invoice #: {invoiceData?.id}
                {"\n"}
                Date: {new Date(invoiceData?.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerText}>
                {invoiceData?.user?.firstName +
                  " " +
                  invoiceData?.user?.lastName}
                {"\n"}
                {invoiceData?.user?.email}
                {"\n"}
                {invoiceData?.user?.phone}
              </Text>
            </View>
          </View>

          {/* Rental Details Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Details</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col1]}>
                  Bike Type & Model
                </Text>
                <Text style={[styles.tableHeaderText, styles.col2]}>
                  Rental Period
                </Text>
                <Text style={[styles.tableHeaderText, styles.col4]}>
                  Rate/Day
                </Text>
                <Text style={[styles.tableHeaderText, styles.col5]}>Total</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>
                  {invoiceData?.bike?.brand + " | " + invoiceData?.bike?.model}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {new Date(invoiceData?.startTime).toLocaleDateString()} -{" "}
                  {new Date(invoiceData?.endTime).toLocaleDateString()}
                  {"\n"}({invoiceData?.days} days)
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  ${invoiceData?.bike?.dailyRate}
                </Text>
                <Text style={[styles.tableCell, styles.col5]}>
                  $
                  {(invoiceData?.bike?.dailyRate * invoiceData?.days).toFixed(
                    2
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>
                  ${parseFloat(invoiceData?.totalAmount || "0").toFixed(2)}
                </Text>
              </View>
              {invoiceData?.discountAmount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount:</Text>
                  <Text style={styles.totalValue}>
                    -$
                    {parseFloat(invoiceData?.discountAmount || "0").toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>
                  ${parseFloat(invoiceData?.totalAmount || "0").toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              1. Rental rates are per bike per day. Late returns incur
              additional charges.{"\n"}
              2. Renter is responsible for any damage or theft during rental
              period.{"\n"}
              3. All rentals require a valid photo ID and signed waiver.{"\n"}
              4. Payment is due upon return unless other arrangements have been
              made.{"\n"}
              5. Cancellations must be made 24 hours in advance for full refund.
              {"\n"}
              6. Helmets are provided free of charge and must be worn at all
              times.
            </Text>
          </View>
        </Page>
      </Document>
    );
  };

  return InvoiceDocument;
};

const getPdf = async (booking: any) => {
  const { renderToStream } = await import("@react-pdf/renderer");

  const InvoiceDocument = await getInvoice();

  const pdf = await renderToStream(<InvoiceDocument invoiceData={booking} />);

  return pdf;
};

export default getPdf;
