<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
	String webapp=request.getContextPath();
		String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ webapp + "/";
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" >
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Suppliers Contact edit page</title>
		<!-- 导入公共js和css -->
		<jsp:include page="/extcommon.jsp"></jsp:include>
		
		<!-- 导入dwr -->
		<script type='text/javascript' src='<%=webapp %>/dwr/interface/cotContactService.js'></script>	
		<script type='text/javascript' src='<%=webapp %>/system/contact/js/contactEdit.js'></script>
		<script type="text/javascript" src="<%=webapp %>/common/js/popedom.js"></script>
	</head>
	<%
		String id = request.getParameter("id");
	%>
	<body scroll=no>
		<div id="modpage"></div>
		<input type="hidden" name="basePath" id="basePath" value="<%=basePath%>" />
		<input type="hidden" name="eId" id="eId" value="<%=id%>">
		<input type="hidden" id="personName" value="<%= request.getAttribute("name")%>">
		<input type="hidden" id="personEmailUrl" value="<%= request.getParameter("emailUrl")%>">
	</body>
</html>
