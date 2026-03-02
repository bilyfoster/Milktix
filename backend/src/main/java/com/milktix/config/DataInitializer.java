package com.milktix.config;

import com.milktix.entity.*;
import com.milktix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setFullName("System Administrator");
            admin.setEmail("admin@milktix.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }

        // Create categories if not exist
        if (categoryRepository.count() == 0) {
            createCategory("Pool Party", "Summer pool parties and water events", "#3B82F6");
            createCategory("Nightlife", "Club nights, parties, and social events", "#8B5CF6");
            createCategory("Music", "Concerts, festivals, and live music", "#EC4899");
            createCategory("Tech", "Technology meetups and conferences", "#10B981");
            createCategory("Sports", "Sporting events and fitness activities", "#F59E0B");
            createCategory("21+", "Adults only events", "#EF4444");
        }

        // Create sample events if not exist
        if (eventRepository.count() == 0) {
            createSampleEvents();
        }
    }

    private void createCategory(String name, String description, String color) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setColor(color);
        categoryRepository.save(category);
    }

    private void createSampleEvents() {
        User organizer = userRepository.findByUsername("admin").orElseThrow();

        // Event 1: Summer Pool Party
        Event poolParty = new Event();
        poolParty.setTitle("Summer Pool Party");
        poolParty.setDescription("Join us for the biggest pool party of the summer! Live DJ, drinks, and fun.");
        poolParty.setStartDateTime(LocalDateTime.now().plusDays(30));
        poolParty.setEndDateTime(LocalDateTime.now().plusDays(30).plusHours(8));
        poolParty.setVenueName("The W Hotel");
        poolParty.setVenueAddress("7277 E Camelback Rd");
        poolParty.setVenueCity("Scottsdale");
        poolParty.setVenueState("AZ");
        poolParty.setVenueZip("85251");
        poolParty.setStatus(Event.Status.PUBLISHED);
        poolParty.setOrganizer(organizer);
        poolParty.getCategories().add(categoryRepository.findByName("Pool Party").orElseThrow());
        poolParty.getCategories().add(categoryRepository.findByName("21+").orElseThrow());
        eventRepository.save(poolParty);

        // Ticket types for pool party
        createTicketType(poolParty, "General Admission", "Access to pool party", new BigDecimal("25.00"), 100);
        createTicketType(poolParty, "VIP", "VIP area + drinks", new BigDecimal("75.00"), 50);
        createTicketType(poolParty, "Cabana", "Private cabana for 6", new BigDecimal("500.00"), 10);

        // Event 2: Tech Meetup
        Event techMeetup = new Event();
        techMeetup.setTitle("Tech Meetup: AI in 2026");
        techMeetup.setDescription("Explore the latest developments in AI technology with industry experts.");
        techMeetup.setStartDateTime(LocalDateTime.now().plusDays(14));
        techMeetup.setEndDateTime(LocalDateTime.now().plusDays(14).plusHours(3));
        techMeetup.setVenueName("Galvanize");
        techMeetup.setVenueAddress("515 E Grant St");
        techMeetup.setVenueCity("Phoenix");
        techMeetup.setVenueState("AZ");
        techMeetup.setVenueZip("85004");
        techMeetup.setStatus(Event.Status.PUBLISHED);
        techMeetup.setOrganizer(organizer);
        techMeetup.getCategories().add(categoryRepository.findByName("Tech").orElseThrow());
        eventRepository.save(techMeetup);

        createTicketType(techMeetup, "Standard", "General admission", new BigDecimal("15.00"), 200);
        createTicketType(techMeetup, "Student", "Student discount", new BigDecimal("5.00"), 50);

        // Event 3: Jazz Night
        Event jazzNight = new Event();
        jazzNight.setTitle("Jazz in the Garden");
        jazzNight.setDescription("An evening of smooth jazz under the stars.");
        jazzNight.setStartDateTime(LocalDateTime.now().plusDays(45));
        jazzNight.setEndDateTime(LocalDateTime.now().plusDays(45).plusHours(4));
        jazzNight.setVenueName("Desert Botanical Garden");
        jazzNight.setVenueAddress("1201 N Galvin Pkwy");
        jazzNight.setVenueCity("Phoenix");
        jazzNight.setVenueState("AZ");
        jazzNight.setVenueZip("85008");
        jazzNight.setStatus(Event.Status.PUBLISHED);
        jazzNight.setOrganizer(organizer);
        jazzNight.getCategories().add(categoryRepository.findByName("Music").orElseThrow());
        eventRepository.save(jazzNight);

        createTicketType(jazzNight, "General", "General admission", new BigDecimal("35.00"), 300);
        createTicketType(jazzNight, "Premium", "Premium seating", new BigDecimal("60.00"), 100);
    }

    private void createTicketType(Event event, String name, String description, BigDecimal price, int quantity) {
        TicketType ticketType = new TicketType();
        ticketType.setName(name);
        ticketType.setDescription(description);
        ticketType.setPrice(price);
        ticketType.setQuantityAvailable(quantity);
        ticketType.setEvent(event);
        ticketTypeRepository.save(ticketType);
    }
}