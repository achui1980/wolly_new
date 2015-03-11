<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
	String webapp=request.getContextPath();
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" >
<html>
	<head>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Proforma Invoice</title>
		<!-- 导入公共js和css -->
		<jsp:include page="/extcommon.jsp"></jsp:include>
		<script type="text/javascript">
			getFacPodom('cotorder.do');
		</script>
		 <!-- 表格中的复选框列 -->
		<script type="text/javascript" src="<%=webapp %>/common/ext/ux/CheckColumn.js"></script>
		 <!-- 单个文件上传css -->
		<link rel="stylesheet" type="text/css" href="<%=webapp%>/common/ext/ux/css/file-upload.css" />
		<link rel="stylesheet" type="text/css" href="<%=webapp %>/common/css/chooser.css" />
		<!-- 单个文件上传js -->
		<script type='text/javascript' src='<%=webapp%>/common/ext/ux/FileUploadField.js'></script>
		<!-- 下列多选框 -->
		<link rel="stylesheet" type="text/css" href="<%=webapp%>/common/ext/ux/css/MultiSelect.css"/> 
		<script type="text/javascript" src="<%=webapp%>/common/ext/ux/MultiSelect.js"></script> 
		<!-- 合计行 -->
		<link rel="stylesheet" type="text/css" href="<%=webapp %>/common/ext/ux/css/GroupSummary.css" />
		<script type="text/javascript" src="<%=webapp %>/common/ext/ux/GroupSummary.js"></script>
		<style>
			.x-grid3-gridsummary-row-inner{overflow:hidden;width:100%;}/* IE6 requires width:100% for hori. scroll to work */
			.x-grid3-gridsummary-row-offset{width:10000px;}
			.x-grid-hide-gridsummary .x-grid3-gridsummary-row-inner{display:none;}
			.x-grid-record-green  tr{ 
			    /*background: darkgreen;*/
			    background:lightgreen ;
			}
		</style>
		
		<!-- 图片鼠标拖拉选择框 -->
		<script type="text/javascript" src="<%=webapp %>/common/ext/ux/DataView-more.js"></script>
		
		<!-- 导入dwr -->
		<script type='text/javascript' src='<%=webapp %>/dwr/interface/cotCustomerService.js'></script> 
		<script type='text/javascript' src='<%=webapp %>/dwr/interface/cotFactoryService.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/cotOrderService.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/cotOrderFacService.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/cotElementsService.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/sysdicutil.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/setNoService.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/queryService.js'></script>
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/importPicService.js'></script>
		<script type='text/javascript' src='<%=webapp %>/dwr/interface/cotOrderStatusFileService.js'></script>
		<script type='text/javascript' src='<%=webapp %>/dwr/interface/cotOrderOutService.js'></script>
		<!-- MAP -->
		<script type="text/javascript" src="<%=webapp %>/common/js/map.js"></script>
		
		<script type="text/javascript" src="<%=webapp %>/common/js/uploadpanel.js"></script>
		<script type="text/javascript" src="<%=webapp %>/common/js/printPanel.js"></script>
		<!--  script type="text/javascript" src="<%=webapp %>/order/js/ordercontractsd.js"></script>-->
		<script type='text/javascript' src='<%=webapp %>/order/js/panWin.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/tongChooseWin.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/uploadPan.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/orderAdd.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/priceGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/orderGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/givenGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/childGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/fittingGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/fitGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/panEleGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/hispriceGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/elePriceGrid.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/reportPanel.js'></script>
		<script type="text/javascript" src="<%=webapp %>/commonQuery/js/eleQuery.js"></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/importPicPanel.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/importPanel.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/modPrice.js'></script>
		<script type='text/javascript' src='<%=webapp %>/commonQuery/js/importPanel.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/fitPricePanel.js'></script>
		<script type='text/javascript' src='<%=webapp %>/order/js/panDetailWin.js'></script>
		<script type='text/javascript' src='<%=webapp%>/queryAll/js/OrderDetailStatusUploadWin.js'></script>
		<script type='text/javascript' src='<%=webapp %>/queryAll/js/orderToOrderOutWin.js'></script>
		<script type='text/javascript' src='<%=webapp%>/queryAll/js/orderfacdetailCopy.js'></script>
		<script type='text/javascript' src='<%=webapp%>/queryAll/js/PdfComment.js'></script>
		<!-- 上传图片 -->
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/contexUtil.js'></script>
		<link rel="stylesheet" type="text/css" href="<%=webapp %>/common/css/SwfUploadPanel.css" />
		<script type="text/javascript" src="<%=webapp %>/common/js/swfupload_2.2.js"></script>
		<script type='text/javascript' src='<%=webapp %>/common/js/SwfUploadPanel.js'></script>
		<script type="text/javascript" src="<%=webapp %>/common/js/handlers.js"></script>
		<link href="<%=webapp %>/common/css/swfUpload.css" rel="stylesheet" type="text/css" />
		
		<script type="text/javascript" src="<%=webapp %>/common/js/popedom.js"></script>
	</head>
	<%
		String id = request.getParameter("id");
		String cusId = request.getParameter("custId");
		String busiId = request.getParameter("busiId");
		String poId = request.getParameter("poId");
		String commentType = request.getParameter("commentType");
	%>
	<body onload="mask('Loading')">
		<div class="tab" id="talPriceDiv"
			style="position: absolute; top: 230px; left:500px;display: none;">
			<label style="font-size: 10pt; color: #10418C; font: bold">
				Total PI Amount:
			</label>
			<label id="totalLab" style="color: red; font-size: 12; font: bold">
				0
			</label>
			<label
					style="font-size: 10pt; color: #10418C; font: bold; margin-left: 20px;display:none;">
				实际金额:
			</label>
			<label id="realLab" style="color: red; font-size: 12; font: bold;display:none;">
				0
			</label>
			<label
					style="font-size: 10pt; color: #10418C; font: bold; margin-left: 20px;display:none;">
				总体积:
			</label>
			<label id="totalCbmLab" style="color: red; font-size: 12; font: bold;display:none;">
				0
			</label>
			<label
					style="font-size: 10pt; color: #10418C; font: bold; margin-left: 20px;display:none;">
				总毛重:
			</label>
			<label id="totalGrossLab" style="color: red; font-size: 12; font: bold;display:none;">
				0
			</label>
			<label
					style="font-size: 10pt; color: #10418C; font: bold; margin-left: 20px;">
				Average profit:
			</label>
			<label id="averageProfit" style="color: red; font-size: 12; font: bold;">
				0
			</label>
			<label
					style="font-size: 10pt; color: #10418C; font: bold; margin-left: 20px;">
				Profit Amount<font color=green>US$</font>
			</label>
			<label id="totalProfit" style="color: red; font-size: 12; font: bold;">
				0
			</label>	
			<label
					style="font-size: 10pt; color: #10418C; font: bold; margin-left: 20px;">
				Total cost po/tax/freight:<font color=green>US$</font>
			</label>
			<label id="totalPOSum" style="color: red; font-size: 12; font: bold;">
				0
			</label>
		</div>
		<input type="hidden" id="pId" name="pId" value="<%=id%>" />
		<input type="hidden" id="orderTip" name="orderTip" />
		<input type="hidden" id="noPrice" name="noPrice" />
		<input type="hidden" id="havePrice" name="havePrice" />
		<input type="hidden" id="insertType" name="insertType" />
		<input type="hidden" name="oldCur" id="oldCur" />
		<input type="hidden" id="con20" />
		<input type="hidden" id="con40" />
		<input type="hidden" id="con40H" />
		<input type="hidden" id="con45" />
		<input type="hidden" id="cusId" name="cusId" value="<%=cusId%>" />
		<input type="hidden" id="busiId" name="busiId" value="<%=busiId%>" />
		<input type="hidden" id="prePriceHid" />
		<input type="hidden" id="priceScalHid" />
		<!-- 上传麦标成功标识 -->
		<input type="hidden" name="uploadSuc" id="uploadSuc" />
		<input type="hidden" id="buyerId" name="buyerId" value="" />
		<input type="hidden" id="facId" name="facId" value="" />
		<input type="hidden" id="isCheckId" name="isCheckId" value="" />
		
		<input type="hidden" id="poId" name="poId" value="<%=poId%>" />
		<input type="hidden" id="commentType" name="commentType" value="<%=commentType%>" />
		
		</body>
</html>
