<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%
	String webapp=request.getContextPath();
	//String empId = request.getSession().getAttribute("empId");
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" >
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<jsp:include page="/extcommon.jsp"></jsp:include>
		<script type='text/javascript' src='<%=webapp%>/dwr/interface/cotContactService.js'></script>
		<script type='text/javascript' src='<%=webapp%>/system/factory/js/contactGrid.js'></script>
		<script type="text/javascript" src="<%=webapp %>/common/js/popedom.js"></script>
	</head>
	<%
		String factoryId = request.getParameter("facId");
	%>
<body>
	<input type="hidden" id="factoryId" name="factoryId" value="<%=factoryId %>" />
</body>
</html>