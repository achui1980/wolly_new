<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
	String webapp=request.getContextPath();
	//String empId = request.getSession().getAttribute("empId");
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" >
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Packaging Materials</title>
		<!-- 导入公共js和css -->
		<jsp:include page="/extcommon.jsp"></jsp:include>
		<!-- 导入dwr -->
		<script type='text/javascript' src='<%=webapp%>/dwr/interface/cotBoxPackingService.js'></script>
		<script type='text/javascript' src='<%=webapp%>/systemdic/boxpacking/js/boxpacking.js'></script>
		<script type="text/javascript" src="<%=webapp %>/common/js/popedom.js"></script>
	</head>
	<body>
	</body>
</html>