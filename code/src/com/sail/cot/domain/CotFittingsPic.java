package com.sail.cot.domain;

/**
 * CotFittingsPic entity.
 * 
 * @author MyEclipse Persistence Tools
 */

public class CotFittingsPic implements java.io.Serializable {

	// Fields

	private Integer id;
	private Integer fkId;
	private byte[] picImg;
	private Integer picSize;
	private String eleId;
	private String picName;

	// Constructors

	/** default constructor */
	public CotFittingsPic() {
	}

	/** full constructor */
	public CotFittingsPic(CotFittings cotFittings, byte[] picImg,
			Integer picSize, String eleId, String picName) {
		
		this.picImg = picImg;
		this.picSize = picSize;
		this.eleId = eleId;
		this.picName = picName;
	}

	// Property accessors

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getFkId() {
		return fkId;
	}

	public void setFkId(Integer fkId) {
		this.fkId = fkId;
	}

	public byte[] getPicImg() {
		return picImg;
	}

	public void setPicImg(byte[] picImg) {
		this.picImg = picImg;
	}

	public Integer getPicSize() {
		return this.picSize;
	}

	public void setPicSize(Integer picSize) {
		this.picSize = picSize;
	}

	public String getEleId() {
		return this.eleId;
	}

	public void setEleId(String eleId) {
		this.eleId = eleId;
	}

	public String getPicName() {
		return this.picName;
	}

	public void setPicName(String picName) {
		this.picName = picName;
	}

}