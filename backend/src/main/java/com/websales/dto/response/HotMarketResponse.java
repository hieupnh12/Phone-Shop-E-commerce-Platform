package com.websales.dto.response;

import java.util.List;

public record HotMarketResponse(List<String> hotPhones, List<String> reasons) {
}
