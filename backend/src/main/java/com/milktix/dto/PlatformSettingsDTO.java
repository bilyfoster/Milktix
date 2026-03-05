package com.milktix.dto;

import java.math.BigDecimal;

/**
 * DTO for platform fee settings.
 */
public class PlatformSettingsDTO {

    private BigDecimal platformFeePercentage;
    private BigDecimal platformFeeFixed;
    private BigDecimal stripeFeePercentage;
    private BigDecimal stripeFeeFixed;

    // Constructors
    public PlatformSettingsDTO() {}

    public PlatformSettingsDTO(BigDecimal platformFeePercentage, BigDecimal platformFeeFixed,
                               BigDecimal stripeFeePercentage, BigDecimal stripeFeeFixed) {
        this.platformFeePercentage = platformFeePercentage;
        this.platformFeeFixed = platformFeeFixed;
        this.stripeFeePercentage = stripeFeePercentage;
        this.stripeFeeFixed = stripeFeeFixed;
    }

    // Getters and Setters
    public BigDecimal getPlatformFeePercentage() {
        return platformFeePercentage;
    }

    public void setPlatformFeePercentage(BigDecimal platformFeePercentage) {
        this.platformFeePercentage = platformFeePercentage;
    }

    public BigDecimal getPlatformFeeFixed() {
        return platformFeeFixed;
    }

    public void setPlatformFeeFixed(BigDecimal platformFeeFixed) {
        this.platformFeeFixed = platformFeeFixed;
    }

    public BigDecimal getStripeFeePercentage() {
        return stripeFeePercentage;
    }

    public void setStripeFeePercentage(BigDecimal stripeFeePercentage) {
        this.stripeFeePercentage = stripeFeePercentage;
    }

    public BigDecimal getStripeFeeFixed() {
        return stripeFeeFixed;
    }

    public void setStripeFeeFixed(BigDecimal stripeFeeFixed) {
        this.stripeFeeFixed = stripeFeeFixed;
    }
}
