package com.milktix.service;

import com.milktix.dto.OrganizerRequestCreate;
import com.milktix.dto.OrganizerRequestResponse;
import com.milktix.dto.UserSummary;
import com.milktix.entity.OrganizerRequest;
import com.milktix.entity.User;
import com.milktix.repository.OrganizerRequestRepository;
import com.milktix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizerRequestService {

    @Autowired
    private OrganizerRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public OrganizerRequestResponse createRequest(UUID userId, OrganizerRequestCreate request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a pending request
        if (requestRepository.existsByUserIdAndStatus(userId, OrganizerRequest.Status.PENDING)) {
            throw new RuntimeException("You already have a pending organizer request");
        }

        // Check if user is already an organizer
        if (user.getRole() == User.Role.ORGANIZER) {
            throw new RuntimeException("You are already an organizer");
        }

        OrganizerRequest organizerRequest = new OrganizerRequest();
        organizerRequest.setUser(user);
        organizerRequest.setBusinessName(request.businessName());
        organizerRequest.setBusinessDescription(request.businessDescription());
        organizerRequest.setTaxId(request.taxId());
        organizerRequest.setWebsite(request.website());
        organizerRequest.setPhoneNumber(request.phoneNumber());
        organizerRequest.setBusinessEmail(request.businessEmail());
        organizerRequest.setStatus(OrganizerRequest.Status.PENDING);

        OrganizerRequest saved = requestRepository.save(organizerRequest);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrganizerRequestResponse getMyRequest(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizerRequest request = requestRepository.findByUser(user)
                .orElse(null);

        return request != null ? mapToResponse(request) : null;
    }

    @Transactional(readOnly = true)
    public List<OrganizerRequestResponse> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrganizerRequestResponse> getRequestsByStatus(OrganizerRequest.Status status) {
        return requestRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrganizerRequestResponse reviewRequest(UUID requestId, UUID adminId, String action, String adminNotes) {
        OrganizerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (request.getStatus() != OrganizerRequest.Status.PENDING) {
            throw new RuntimeException("Request has already been reviewed");
        }

        OrganizerRequest.Status newStatus = OrganizerRequest.Status.valueOf(action);
        request.setStatus(newStatus);
        request.setAdminNotes(adminNotes);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());

        // If approved, update user role to ORGANIZER
        if (newStatus == OrganizerRequest.Status.APPROVED) {
            User user = request.getUser();
            user.setRole(User.Role.ORGANIZER);
            userRepository.save(user);
        }

        OrganizerRequest saved = requestRepository.save(request);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public long getPendingCount() {
        return requestRepository.findByStatusOrderByCreatedAtDesc(OrganizerRequest.Status.PENDING).size();
    }

    private OrganizerRequestResponse mapToResponse(OrganizerRequest request) {
        UserSummary userSummary = new UserSummary(
                request.getUser().getId(),
                request.getUser().getFullName()
        );

        UserSummary reviewedBySummary = request.getReviewedBy() != null ?
                new UserSummary(request.getReviewedBy().getId(), request.getReviewedBy().getFullName()) :
                null;

        return new OrganizerRequestResponse(
                request.getId(),
                request.getBusinessName(),
                request.getBusinessDescription(),
                request.getTaxId(),
                request.getWebsite(),
                request.getPhoneNumber(),
                request.getBusinessEmail(),
                request.getStatus().name(),
                request.getAdminNotes(),
                userSummary,
                reviewedBySummary,
                request.getReviewedAt(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
