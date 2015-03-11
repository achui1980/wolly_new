package com.sail.cot.util.pdf.create;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.junit.Test;

import com.itextpdf.text.BadElementException;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.Font.FontFamily;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.sail.cot.domain.CotOrderDetail;
import com.sail.cot.domain.VProformaInvoice;
import com.sail.cot.util.ContextUtil;
import com.sail.cot.util.RMB;
import com.sail.cot.util.SystemUtil;
import com.sail.cot.util.pdf.util.TableHeader;

public class PIPdf {
	
	private VProformaInvoice vpInvoice;
	private List<CotOrderDetail> detailList;
	private HttpServletRequest request;
	private String isReport = null;
	
	public Document initDocument(){
		Rectangle rectangle = new Rectangle(PageSize.getRectangle("A4"));
		
		Document document = new Document(rectangle,20,20,10,10);
//		document.setPageSize(rectangle);
//		document.setMargins(20, 20, 10, 10);
		return document;
	}
	
	private PdfPTable createHeader() throws BadElementException, MalformedURLException, IOException{
		
		Image gif = Image.getInstance(vpInvoice.getCompanyLogo());
		gif.scaleAbsolute(103, 60);
		
		float[] widths = {42f,89f,62f};
		PdfPTable headTable = new PdfPTable(widths);
		headTable.setWidthPercentage(100);
		headTable.getDefaultCell().setBorder(0); // 无边框
//		headTable.getDefaultCell().setPadding(30);
		
		PdfPCell pdfPCell = new PdfPCell();
		pdfPCell.setColspan(3);
		pdfPCell.setBorder(0);
		pdfPCell.setPaddingBottom(15);
		String isPreview = null;
		try{
			isPreview = request.getParameter("isPreview");
		}catch(Exception e){}
		try {
			isReport = request.getParameter("isReport");
		} catch (Exception e) {}
		
		if("true".equals(isReport))
			pdfPCell.addElement(new Paragraph("Shipment Sample Approval Report",new Font(FontFamily.UNDEFINED, 15, Font.BOLD, null)));
		else if("true".equals(isPreview))
			pdfPCell.addElement(new Paragraph("Proforma Invoice - Draft",new Font(FontFamily.UNDEFINED, 15, Font.BOLD, null)));
		else
			pdfPCell.addElement(new Paragraph("Proforma Invoice",new Font(FontFamily.UNDEFINED, 15, Font.BOLD, null)));
		
		headTable.addCell(pdfPCell);
		
		pdfPCell = new PdfPCell();
//		pdfPCell.setImage(gif);
		pdfPCell.addElement(gif);
		pdfPCell.setRowspan(6);
		pdfPCell.setBorder(0);
		headTable.addCell(pdfPCell);
		
		headTable.addCell(new Paragraph("Date:",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		
		headTable.addCell(new Paragraph("Buyer order No.            "+vpInvoice.getPoNo(),new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		
		pdfPCell = new PdfPCell();
		pdfPCell.setColspan(2);
		pdfPCell.setBorder(0);
		pdfPCell.setPaddingTop(-1f);
		pdfPCell.addElement(new Paragraph(RMB.changeDate(vpInvoice.getAddTime(),"dd MMMMM yyyy")+" "+vpInvoice.getAddperosn(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		headTable.addCell(pdfPCell);
		
		pdfPCell = new PdfPCell();
		pdfPCell.setBorder(0);
		pdfPCell.setColspan(2);
		pdfPCell.setRowspan(3);
		pdfPCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
		pdfPCell.setFixedHeight(27);
		pdfPCell.addElement(new Paragraph("Revised",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		headTable.addCell(pdfPCell);
		
		pdfPCell = new PdfPCell();
		pdfPCell.setColspan(2);
		pdfPCell.setBorder(0);
		pdfPCell.setPaddingTop(-1f);
		pdfPCell.addElement(new Paragraph(RMB.changeDate(vpInvoice.getModtime(),"dd MMMMM yyyy")+" "+vpInvoice.getCheckperson(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		headTable.addCell(pdfPCell);
		return headTable;
	}
	
	public PdfPTable createTopLeftTable() throws DocumentException{
		PdfPTable table = new PdfPTable(3);
		table.setWidths(new int[]{34, 8, 10});
		table.getDefaultCell().setBorder(0);
		table.setTotalWidth(555);
		table.getDefaultCell().setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setLockedWidth(true);
        table.getDefaultCell().setFixedHeight(20);
		table.setWidthPercentage(60f);
		PdfPCell cell = new PdfPCell();
		boolean isAgent = vpInvoice.getIsCheckAgent() == 1;
		cell.setRowspan(isAgent?9:8);
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph("W&C Order No.",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(vpInvoice.getBusinessPerson()+vpInvoice.getOrderNo(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		
//		cell = new PdfPCell(new Paragraph("Sales",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
//		cell.setBorder(0);
//		table.addCell(cell);
//		cell = new PdfPCell(new Paragraph(vpInvoice.getBusinessPerson(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
//		cell.setBorder(0);
//		table.addCell(cell);
		
//		cell = new PdfPCell(new Paragraph("Sales",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
//		cell.setBorder(0);
//		table.addCell(cell);
//		cell = new PdfPCell(new Paragraph(vpInvoice.getBusinessPerson(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
//		cell.setBorder(0);
//		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Department",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(vpInvoice.getTypeEnName(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Shipment Date.",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(RMB.changeDate(vpInvoice.getOrderLcDate(),"dd MMMMM yyyy"),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Delivery Date",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(RMB.changeDate(vpInvoice.getSendTime(),"dd MMMMM yyyy"),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Delivery Terms",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		if(vpInvoice.getClauseName()==null || vpInvoice.getClauseName().trim().equals(""))
			cell = new PdfPCell(new Paragraph(" "));
		else {
			boolean isClauseName = vpInvoice.getClauseName().equalsIgnoreCase("fob");
			cell = new PdfPCell(new Paragraph(vpInvoice.getClauseName()+" "+(isClauseName?vpInvoice.getDepapture():vpInvoice.getDestination()),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
//			cell = new PdfPCell(new Paragraph(vpInvoice.getClauseName(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		}
		cell.setBorder(0);
		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Payment Terms",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(vpInvoice.getPayName(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Currency",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(vpInvoice.getCurNameen(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		
		if(isAgent){
			cell = new PdfPCell(new Paragraph("Commission",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
			cell.setBorder(0);
			table.addCell(cell);
			if(vpInvoice.getCommisionScale()!=null)
				cell = new PdfPCell(new Paragraph(vpInvoice.getCommisionScale().intValue()+"%",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
			else
				cell = new PdfPCell(new Paragraph(""));
			cell.setBorder(0);
			table.addCell(cell);
		}
	
		cell = new PdfPCell(new Paragraph("Comments",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setBorder(0);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(vpInvoice.getOrderRemark(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		cell.setBorder(0);
		table.addCell(cell);
		return table;
	}
	
	public PdfPTable createBody() throws MalformedURLException, IOException, DocumentException{
//		String title[] = {"Article No.","Client Article No.","Description","Barcode","Size","Quantity","Amount","Total"};
		String title[] = {"Description","Barcode","Client Article No.","Size","Quantity","Unit","Amount","Total"};
		// 设置表格的形式
		PdfPTable table = new PdfPTable(new float[]{22,10,10,10,6,4,9,9}); // 最外表
		table.setSplitLate(false);
		PdfPCell defaultCell = table.getDefaultCell();
//		defaultCell.setGrayFill(0.8f);
//		defaultCell.setFixedHeight(200);
		
		table.setWidthPercentage(100);
		table.setHeaderRows(1);
		defaultCell.setPaddingBottom(5);
		defaultCell.setBorder(0); // 无边框
		defaultCell.setBackgroundColor(new BaseColor(240,240,240));
		defaultCell.setBorderColorRight(BaseColor.WHITE);
		defaultCell.setBorderWidthRight(1f);
		
		Font boldFont = new Font();
		boldFont.setStyle(Font.BOLD);
		boldFont.setSize(8);
		PdfPCell cell = null;
		
		cell = new PdfPCell();
		cell.setColspan(title.length);
		cell.setBorder(0);
		cell.setPaddingBottom(30);
		cell.addElement(this.createHeader());
		table.addCell(cell);
		
		cell = new PdfPCell();
		cell.setColspan(title.length);
		cell.setBorder(0);
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);
		cell.setPaddingBottom(10);
		cell.addElement(this.mailHeaderTable());
		table.addCell(cell);
		
		for(int i = 0;i<title.length;i++){
			cell = new PdfPCell();
			cell.addElement(new Paragraph(String.valueOf(title[i]),boldFont));
			cell.setBorder(0);
			cell.setPaddingBottom(5f);
			table.addCell(cell);
		}
		Font font = new Font();
		font.setSize(8);
		// 表体设置
		for(int i = 0;i<detailList.size();i++){
			if(i%2==0)
				defaultCell.setBackgroundColor(new BaseColor(240,240,240));
			else
				defaultCell.setBackgroundColor(BaseColor.WHITE);
			defaultCell.setHorizontalAlignment(Element.ALIGN_LEFT);
			CotOrderDetail detail = detailList.get(i);
//			table.addCell(new Paragraph(detail.getEleId(),font));
			table.addCell(new Paragraph(detail.getEleNameEn(),font));
			table.addCell(new Paragraph(detail.getBarcode(),font));
			table.addCell(new Paragraph(detail.getCustNo(),font));
//			defaultCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(new Paragraph(detail.getEleInchDesc(),font));
			if(detail.getBoxCount()==null)
				table.addCell(new Paragraph("",font));
			else 
				table.addCell(new Paragraph(RMB.getPrecision(detail.getBoxCount(), 0),font));
			table.addCell(new Paragraph((detail.getEleUnit() == null?"":detail.getEleUnit()),font));
			table.addCell(new Paragraph(ContextUtil.getObjByPrecision(detail.getOrderPrice(), "orderPricePrecision"),font));
			table.addCell(new Paragraph(RMB.getPrecision(detail.getTotalMoney(), 2),font));
		}
		
		cell = new PdfPCell(new Paragraph(""));
		cell.setColspan(title.length);
		cell.setBorder(0);
		table.addCell(cell);
		
		cell = new PdfPCell(new Paragraph("Total Amount: "+RMB.getPrecision(vpInvoice.getTotalMoney(), 2),new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		cell.setColspan(title.length);
		cell.setBorder(0);
		cell.setBorderColor(new BaseColor(120,120,120));
		cell.setBorderWidthTop(.1f);
		cell.setBorderWidthBottom(.1f);
//		cell.setUseDescender(true);
		cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
		cell.setPaddingBottom(6f);
		cell.setPaddingRight(1f);
		table.addCell(cell);
		
		this.mailRootTable(table);
		

		if("true".equals(isReport)){
			defaultCell.setColspan(8);
			defaultCell.setPaddingRight(1f);
			table.addCell(this.createBodyTwo());
			
			this.mailRootTableTwo(table);
		}
		
		
		
		
		return table;
	}
	public PdfPTable createBodyTwo() throws MalformedURLException, IOException, DocumentException{
//		String title[] = {"Article No.","Client Article No.","Description","Barcode","Size","Quantity","Amount","Total"};
		String title[] = {"Description","Barcode","Client Article No.","Size","Color","Weight","Smell","Packing","General"};
		// 设置表格的形式
		PdfPTable table = new PdfPTable(new float[]{16,12,12,10,9,9,9,9,9}); // 最外表
		table.setSplitLate(false);
		PdfPCell defaultCell = table.getDefaultCell();
//		defaultCell.setGrayFill(0.8f);
//		defaultCell.setFixedHeight(200);
		
		table.setWidthPercentage(100);
		table.setHeaderRows(1);
		defaultCell.setPaddingBottom(5);
		defaultCell.setBorder(0); // 无边框
		defaultCell.setBackgroundColor(new BaseColor(240,240,240));
		defaultCell.setBorderColorRight(BaseColor.WHITE);
		defaultCell.setBorderWidthRight(1f);
		
		Font boldFont = new Font();
		boldFont.setStyle(Font.BOLD);
		boldFont.setSize(8);
		PdfPCell cell = null;
		
		for(int i = 0;i<title.length;i++){
			cell = new PdfPCell();
			cell.addElement(new Paragraph(String.valueOf(title[i]),boldFont));
			cell.setBorder(0);
			cell.setPaddingBottom(5f);
			table.addCell(cell);
		}
		Font font = new Font();
		font.setSize(8);
		// 表体设置
		for(int i = 0;i<detailList.size();i++){
			if(i%2==0)
				defaultCell.setBackgroundColor(new BaseColor(240,240,240));
			else
				defaultCell.setBackgroundColor(BaseColor.WHITE);
			defaultCell.setHorizontalAlignment(Element.ALIGN_LEFT);
			CotOrderDetail detail = detailList.get(i);
//			table.addCell(new Paragraph(detail.getEleId(),font));
			table.addCell(new Paragraph(detail.getEleNameEn(),font));
			table.addCell(new Paragraph(detail.getBarcode(),font));
			table.addCell(new Paragraph(detail.getCustNo(),font));
//			defaultCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(new Paragraph(detail.getEleInchDesc(),font));
			table.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			table.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			table.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			table.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			table.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
//			if(detail.getBoxCount()==null)
//				table.addCell(new Paragraph("",font));
//			else 
//				table.addCell(new Paragraph(RMB.getPrecision(detail.getBoxCount(), 0),font));
//			table.addCell(new Paragraph((detail.getEleUnit() == null?"":detail.getEleUnit()),font));
//			table.addCell(new Paragraph(RMB.getPrecision(detail.getOrderPrice(), 2),font));
//			table.addCell(new Paragraph(RMB.getPrecision(detail.getTotalMoney(), 2),font));
		}
		
		cell = new PdfPCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
		cell.setColspan(title.length);
		cell.setBorder(0);
		table.addCell(cell);
		table.addCell(cell);
		table.addCell(cell);
		for(int i = 0;i<detailList.size();i++){
			table.addCell(cell);
		}
		
		
		
		
		
		return table;
	}
	
	public PdfPTable mailHeaderTable(){
		boolean isAgent = vpInvoice.getIsCheckAgent() == 1;
		PdfPTable table = new PdfPTable(isAgent?3:2);
		table.setWidthPercentage(65);
		table.setHorizontalAlignment(Element.ALIGN_LEFT);
		PdfPCell defaultCell = table.getDefaultCell();
		defaultCell.setBorder(0); // 无边框
		defaultCell.setBackgroundColor(new BaseColor(240,240,240));
		defaultCell.setBorderColorRight(BaseColor.WHITE);
		defaultCell.setBorderWidthRight(4f);
		defaultCell.setVerticalAlignment(Element.ALIGN_CENTER);
		defaultCell.setFixedHeight(15f);
		
		table.addCell(new Paragraph("Buyer",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		table.addCell(new Paragraph("Seller",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		if(isAgent)
			table.addCell(new Paragraph("Agent",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
		
		defaultCell.setBackgroundColor(BaseColor.WHITE);
		
		defaultCell.setFixedHeight(0.0f);
		defaultCell.setPaddingTop(6f);
		defaultCell.setPaddingRight(10f);
		defaultCell.setLeading(0, 1.3f);
		String buyer = vpInvoice.getBuyer();
		if(!StringUtils.isEmpty(vpInvoice.getContact())){
			buyer += "\r\n"+"Buyer:"+vpInvoice.getContact();
		}
		String seller = vpInvoice.getSeller();
		buyer = buyer==null ? " ":buyer;
		seller = seller == null ? " " : seller;
		table.addCell(new Paragraph(buyer.replace(",", " "),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		table.addCell(new Paragraph(seller.replace(",", " "),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		if(isAgent){
			String agent = vpInvoice.getAgent();
			agent = agent == null ? " " : agent;
			table.addCell(new Paragraph(agent.replace(",", " "),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		}
		
		return table;
	}
//	public PdfPTable mailRootTable(PdfPTable table) throws DocumentException{
//		PdfPCell defaultCell = table.getDefaultCell();
//		defaultCell.setBackgroundColor(BaseColor.WHITE);
//		defaultCell.setHorizontalAlignment(Element.ALIGN_LEFT);
//		defaultCell.setLeading(0, 1.4f);
//		
//		PdfPTable leftTable = new PdfPTable(1);
//		PdfPCell leftCell = leftTable.getDefaultCell();
//		leftCell.setBorder(0);
//		leftCell.setBackgroundColor(BaseColor.WHITE);
//		leftCell.setHorizontalAlignment(Element.ALIGN_LEFT);
//		leftCell.setLeading(0, 1.4f);
//		
//		leftCell.setPaddingTop(20f);
//		leftTable.addCell(new Paragraph("Quality",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
//		leftCell.setPaddingTop(-2f);
//		leftTable.addCell(new Paragraph(vpInvoice.getQuality(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
//		
//		leftCell.setPaddingTop(20f);
//		leftTable.addCell(new Paragraph("Packing",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
//		
//		leftCell.setPaddingTop(-2f);
//		
//		PdfPTable unitTable = new PdfPTable(1);
//		unitTable.getDefaultCell().setLeading(0, 1.3f);
//		unitTable.getDefaultCell().setBorder(0);
//		unitTable.getDefaultCell().setPaddingLeft(-1);
//		unitTable.getDefaultCell().setPaddingTop(-1);
//		unitTable.addCell(new Paragraph("Sales Unit",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
//		unitTable.addCell(new Paragraph(vpInvoice.getSaleUnit(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
//		unitTable.getDefaultCell().setPaddingTop(4f);
//		unitTable.addCell(new Paragraph("Handling Unit",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
//		unitTable.getDefaultCell().setPaddingTop(-1f);
//		unitTable.addCell(new Paragraph(vpInvoice.getHandleUnit(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
//		leftTable.addCell(unitTable);
//		
//		defaultCell.setColspan(3);
//		table.addCell(leftTable);
//		
//		PdfPTable rightTable = new PdfPTable(1);
//		PdfPCell rightCell = rightTable.getDefaultCell();
//		rightCell.setBorder(0);
//		rightCell.setBackgroundColor(BaseColor.WHITE);
//		rightCell.setHorizontalAlignment(Element.ALIGN_LEFT);
//		rightCell.setLeading(0, 1.4f);
//		
//		rightCell.setPaddingTop(20f);
//		rightTable.addCell(new Paragraph("Colours",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
//		rightCell.setPaddingTop(-2f);
//		rightTable.addCell(new Paragraph(vpInvoice.getColours(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
//		
//		rightCell.setPaddingTop(20f);
//		rightTable.addCell(new Paragraph("Packing Assortment",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
//		
//		rightCell.setPaddingTop(-2f);
//		rightTable.addCell(new Paragraph(vpInvoice.getAssortment(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
//		
//		rightCell.setPaddingTop(20f);
//		rightTable.addCell(new Paragraph("Comments",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
//		rightCell.setPaddingTop(-2f);
//		rightTable.addCell(new Paragraph(vpInvoice.getCommnets(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
//		
//		defaultCell.setColspan(5);
//		table.addCell(rightTable);
//		
//		
//		return table;
//	}
	public PdfPTable mailRootTableTwo(PdfPTable table) throws DocumentException{
		PdfPCell defaultCell = table.getDefaultCell();
		defaultCell.setBackgroundColor(BaseColor.WHITE);
		defaultCell.setHorizontalAlignment(Element.ALIGN_LEFT);
		defaultCell.setLeading(0, 1.4f);
		defaultCell.setPaddingBottom(1f);
		
		defaultCell.setColspan(4);
		defaultCell.setPaddingTop(20f);
		PdfPTable selTable = new PdfPTable(new float[]{16,2,9,64});
		selTable.setSplitLate(false);
		selTable.getDefaultCell().setPaddingTop(0f);
		selTable.getDefaultCell().setPaddingBottom(0f);
		selTable.getDefaultCell().setBorder(0);
		selTable.getDefaultCell().setPaddingLeft(5f);
		selTable.getDefaultCell().setLeading(0, 0.8f);
		
		defaultCell.setColspan(8);
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		table.addCell(new Paragraph("Comment",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		defaultCell.setBorderWidthBottom(0.1f);
		defaultCell.setBorderColor(new BaseColor(120,120,120));
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		
		defaultCell.setBorderWidthBottom(0);
		
		PdfPCell checkCell = new PdfPCell();
		checkCell.setFixedHeight(1f);
		checkCell.setPhrase(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
		
		selTable.getDefaultCell().setColspan(4);
		selTable.addCell(new Paragraph("Sample Approved:",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		selTable.getDefaultCell().setColspan(1);
		
		selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		selTable.addCell(checkCell);
		selTable.addCell(new Paragraph("All",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		
		selTable.getDefaultCell().setColspan(4);
		selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		selTable.getDefaultCell().setColspan(1);
		
		selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		selTable.addCell(checkCell);
		selTable.addCell(new Paragraph("Partial",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		table.addCell(selTable);
		
		defaultCell.setColspan(4);
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		
		return table;
	}
	
	public PdfPTable mailRootTable(PdfPTable table) throws DocumentException{
		PdfPCell defaultCell = table.getDefaultCell();
		defaultCell.setBackgroundColor(BaseColor.WHITE);
		defaultCell.setHorizontalAlignment(Element.ALIGN_LEFT);
		defaultCell.setLeading(0, 1.4f);
		defaultCell.setPaddingRight(75f);
		defaultCell.setPaddingBottom(1f);
		
		defaultCell.setPaddingTop(20f);
		defaultCell.setColspan(3);
		defaultCell.setPaddingBottom(4f);
		table.addCell(new Paragraph("Quality",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		defaultCell.setColspan(5);
		table.addCell(new Paragraph("Colours",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		defaultCell.setPaddingTop(-2f);
		defaultCell.setColspan(3);
		defaultCell.setPaddingBottom(1f);
		table.addCell(new Paragraph(vpInvoice.getQuality(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		defaultCell.setColspan(5);
		table.addCell(new Paragraph(vpInvoice.getColours(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		
		defaultCell.setPaddingTop(20f);
		defaultCell.setColspan(3);
		defaultCell.setPaddingBottom(4f);
		table.addCell(new Paragraph("Packing",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		defaultCell.setColspan(5);
		table.addCell(new Paragraph("Packing Assortment",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		
		defaultCell.setPaddingTop(-2f);
		
		defaultCell.setColspan(3);
		defaultCell.setPaddingBottom(1f);
		PdfPTable unitTable = new PdfPTable(1);
		unitTable.setSplitLate(false);
		unitTable.getDefaultCell().setLeading(0, 1.3f);
		unitTable.getDefaultCell().setBorder(0);
		unitTable.getDefaultCell().setPaddingLeft(-1);
	
		unitTable.getDefaultCell().setPaddingTop(-1);
		unitTable.getDefaultCell().setPaddingBottom(0f);
		unitTable.addCell(new Paragraph("Sales Unit",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		unitTable.addCell(new Paragraph(vpInvoice.getSaleUnit(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		unitTable.getDefaultCell().setPaddingTop(4f);
		unitTable.addCell(new Paragraph("Handling Unit",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
		unitTable.getDefaultCell().setPaddingTop(-1f);
		unitTable.addCell(new Paragraph(vpInvoice.getHandleUnit(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		table.addCell(unitTable);
		
		defaultCell.setColspan(5);
		table.addCell(new Paragraph(vpInvoice.getAssortment(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		
		defaultCell.setPaddingTop(20f);
		
		defaultCell.setColspan(3);
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		defaultCell.setColspan(5);
		defaultCell.setPaddingBottom(4f);
		table.addCell(new Paragraph("Comments",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)) );
		defaultCell.setPaddingTop(-2f);
		defaultCell.setColspan(3);
		defaultCell.setPaddingBottom(1f);
		table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		defaultCell.setColspan(5);
		table.addCell(new Paragraph(vpInvoice.getCommnets(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		

		if("true".equals(isReport)){
			defaultCell.setColspan(4);
			defaultCell.setPaddingTop(20f);
			PdfPTable selTable = new PdfPTable(new float[]{20,13,3,13,3,9,4,3,40});
			selTable.setSplitLate(false);
			selTable.getDefaultCell().setPaddingTop(0f);
			selTable.getDefaultCell().setPaddingBottom(0f);
			selTable.getDefaultCell().setBorder(0);
			selTable.getDefaultCell().setLeading(0, 0.8f);
			
			selTable.addCell(new Paragraph("Wash Tested",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.getDefaultCell().setPaddingLeft(15f);
			selTable.addCell(new Paragraph("Yes",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
	//		PdfPCell pCell = new PdfPCell();
	//		pCell.addElement(new Rectangle(1,1,1,1));
	//		selTable.addCell(pCell);
			selTable.getDefaultCell().setPaddingLeft(0f);
			PdfPCell checkCell = new PdfPCell();
			checkCell.setFixedHeight(1f);
			checkCell.setPhrase(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			selTable.addCell(checkCell);
			selTable.getDefaultCell().setPaddingLeft(19f);
			selTable.addCell(new Paragraph("No",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.getDefaultCell().setPaddingLeft(0f);
			selTable.addCell(checkCell);
			
			selTable.getDefaultCell().setPaddingLeft(21f);
			selTable.addCell(new Paragraph("o",new Font(FontFamily.UNDEFINED, 4, Font.ITALIC, null)));
			selTable.getDefaultCell().setPaddingLeft(0f);
			selTable.addCell(new Paragraph("C",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			
			selTable.addCell(checkCell);
			selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			
			PdfPCell emptyCell = new PdfPCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)));
			emptyCell.setPadding(-1f);
			emptyCell.setColspan(9);
			emptyCell.setBorder(0);
			selTable.addCell(emptyCell);
			
			selTable.getDefaultCell().setPaddingLeft(0f);
			selTable.addCell(new Paragraph("Passed",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.getDefaultCell().setPaddingLeft(15f);
			selTable.addCell(new Paragraph("Yes",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.getDefaultCell().setPaddingLeft(0f);
			selTable.addCell(checkCell);
			selTable.getDefaultCell().setPaddingLeft(19f);
			selTable.addCell(new Paragraph("No",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.getDefaultCell().setPaddingLeft(0f);
			selTable.addCell(checkCell);
			selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			selTable.addCell(new Paragraph(" ",new Font(FontFamily.UNDEFINED, 8, Font.ITALIC, null)) );
			table.addCell(selTable);
			
			defaultCell.setColspan(4);
			table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)) );
		}
		return table;
	}
	
	public void initComInfo(Document document){
		if(vpInvoice.getOrderNo()!=null){
			document.addTitle("PI_"+vpInvoice.getOrderNo());
			document.addSubject("PI_"+vpInvoice.getOrderNo());
		}
		if(vpInvoice.getCheckperson()!=null)
			document.addAuthor(vpInvoice.getCheckperson());
		document.addKeywords("TCPDF, PDF, example, test, guide");
		document.addCreator("TCPDF");
		
	}
	
	public PdfPTable createSignature() throws BadElementException, MalformedURLException, IOException{
		Image gif = null;
		try {
			gif = Image.getInstance(SystemUtil.getRootPath()+"signature/"+vpInvoice.getCheckperson()+".jpg");
			gif.scaleAbsolute(103, 60);
		} catch (Exception e) {
			// TODO: handle exception
		}
		
		PdfPTable table = new PdfPTable(new float[]{15,30});
		table.setTotalWidth(200);
		table.getDefaultCell().setBorder(0);
		table.setWidthPercentage(60f);
		
		if("true".equals(isReport)){
			PdfPCell aPCell = new PdfPCell(new Paragraph("Approved By",new Font(FontFamily.UNDEFINED, 8, Font.BOLD, null)));
			aPCell.setRowspan(2);
			aPCell.setBorder(0);
			aPCell.setPaddingTop(20f);
			table.addCell(aPCell);
			table.getDefaultCell().setRowspan(1);
		}
		
		PdfPCell pdfPCell = new PdfPCell();
		pdfPCell.setBorder(0);
		if(!"true".equals(isReport)&&gif!=null)
			pdfPCell.addElement(gif);
		else {
			pdfPCell.setFixedHeight(30f);
		}
		table.addCell(pdfPCell);
		
		
		table.getDefaultCell().setVerticalAlignment(Element.ALIGN_RIGHT);
		table.getDefaultCell().setBorderWidthTop(0.1f);
		if("true".equals(isReport))
			table.addCell(new Paragraph("",new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		else
			table.addCell(new Paragraph(vpInvoice.getCheckperson(),new Font(FontFamily.UNDEFINED, 8, Font.UNDEFINED, null)));
		return table;
	}
	
	public void writePdf(PdfWriter writer,Document document) throws MalformedURLException, DocumentException, IOException{
		writer.setBoxSize("art", new Rectangle(36, 54, 900, 10));
		TableHeader event = new TableHeader();
		writer.setPageEvent(event);
		document.open(); 
		this.initComInfo(document);
		this.createTopLeftTable().writeSelectedRows(0, -1, 34, 760, writer.getDirectContent());
		document.add(this.createBody());
		
		
		this.createSignature().writeSelectedRows(0, -1, 370, 20, writer.getDirectContent());
		document.close();
	}
	@Test
	public void createPIPDF(HttpServletResponse response,HttpServletRequest request) throws DocumentException, MalformedURLException, IOException{
		Document document = this.initDocument();
		this.request = request;
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		PdfWriter writer = PdfWriter.getInstance(document, baos);
		this.writePdf(writer,document);
//		HeaderFooter event = new HeaderFooter();
		
//		response.setHeader("Expires", "0");
//        response.setHeader("Cache-Control",
//            "must-revalidate, post-check=0, pre-check=0");
//        response.setHeader("Pragma", "public");
        // setting the content type
        response.setContentType("application/pdf");
		response.setHeader("Content-Disposition", "filename="
				+ URLEncoder.encode(vpInvoice.getOrderNo(), "UTF-8"));		
        // the contentlength
        response.setContentLength(baos.size());
        // write ByteArrayOutputStream to the ServletOutputStream
        OutputStream os = response.getOutputStream();
        baos.writeTo(os);
        os.flush();
        os.close();
	}
	public void createPIPDF(String path) throws DocumentException, MalformedURLException, IOException{
		Document document = this.initDocument();
		PdfWriter writer = PdfWriter.getInstance(document,new FileOutputStream(path));
		this.writePdf(writer,document);
	}

	public VProformaInvoice getVpInvoice() {
		return vpInvoice;
	}

	public void setVpInvoice(VProformaInvoice vpInvoice) {
		this.vpInvoice = vpInvoice;
	}

	public List<CotOrderDetail> getDetailList() {
		return detailList;
	}

	public void setDetailList(List<CotOrderDetail> detailList) {
		this.detailList = detailList;
	}

}
