package com.aether;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;

/**
 * ============================================================================
 * AETHER // SUPER-INTELLIGENCE COGNITIVE SANCTUARY
 * ============================================================================
 * High-performance, zero-dependency Java Web Server.
 * Built strictly with the core Java Standard Library (JDK 11+).
 *
 * Capabilities:
 * - Dynamic static asset serving with MIME auto-detection & caching
 * - RESTful Endpoints: Telemetry, Cognitive Reflections CRUD, AI Insights
 * - Production-ready: respects PORT env variable (Render, Railway, Cloud Run)
 * - Thread-safe in-memory + persistent storage
 * ============================================================================
 */
public class AetherServer {

    private static final int DEFAULT_PORT = 8080;
    private static final long START_TIME = System.currentTimeMillis();
    private static final List<ThoughtRecord> THOUGHTS = new CopyOnWriteArrayList<>();
    private static final String DATA_FILE = "aether_data.json";

    // Curated high-order insights for cognitive resonance
    private static final String[] INSIGHTS = {
        "Intelligence is the compression of chaos into elegant, high-leverage order.",
        "Deep focus is not discipline—it is the elimination of friction between intention and flow.",
        "Time is asymmetric; an hour of transcendent clarity outweighs days of fractured attention.",
        "Simplicity is the final evolution of complexity, stripped of performative noise.",
        "Your cognition shapes reality. Guard your sensory bandwidth as sacred space.",
        "The mind operates at peak resonance when thought and action dissolve into a singular vector.",
        "Silence is not empty; it is the blank canvas where profound architectures are born."
    };

    public static void main(String[] args) {
        int port = getPort();
        loadPersistedThoughts();

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
            server.setExecutor(newVirtualThreadPerTaskExecutorIfAvailable());

            // REST API Endpoints
            server.createContext("/api/status", new StatusHandler());
            server.createContext("/api/insight", new InsightHandler());
            server.createContext("/api/thoughts", new ThoughtsHandler());

            // Static Frontend Handler (Catch-all)
            server.createContext("/", new StaticFileHandler());

            server.start();

            printBanner(port);

            // Graceful shutdown hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[AETHER] Initiating graceful sanctuary shutdown...");
                persistThoughts();
                server.stop(1);
                System.out.println("[AETHER] Sanctuary safely disconnected.");
            }));

        } catch (IOException e) {
            System.err.println("[AETHER CRITICAL ERROR] Failed to initialize server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static int getPort() {
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                return Integer.parseInt(envPort.trim());
            } catch (NumberFormatException ignored) {}
        }
        return DEFAULT_PORT;
    }

    private static java.util.concurrent.Executor newVirtualThreadPerTaskExecutorIfAvailable() {
        // Fallback to cached thread pool for compatibility across JDK 11 through 21+
        return Executors.newCachedThreadPool();
    }

    // =========================================================================
    // API HANDLERS
    // =========================================================================

    /**
     * GET /api/status - Returns real-time server health and runtime telemetry.
     */
    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 204, "");
                return;
            }

            long uptimeSeconds = (System.currentTimeMillis() - START_TIME) / 1000;
            Runtime rt = Runtime.getRuntime();
            long usedMemoryMb = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
            long maxMemoryMb = rt.maxMemory() / (1024 * 1024);

            String json = String.format(Locale.ROOT,
                "{" +
                "\"status\":\"ONLINE\"," +
                "\"uptimeSeconds\":%d," +
                "\"memoryUsedMb\":%d," +
                "\"memoryMaxMb\":%d," +
                "\"thoughtsLogged\":%d," +
                "\"javaVersion\":\"%s\"," +
                "\"timestamp\":\"%s\"" +
                "}",
                uptimeSeconds,
                usedMemoryMb,
                maxMemoryMb,
                THOUGHTS.size(),
                System.getProperty("java.version"),
                Instant.now().toString()
            );

            sendJsonResponse(exchange, 200, json);
        }
    }

    /**
     * GET /api/insight - Delivers a randomized super-intelligence cognitive axiom.
     */
    static class InsightHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 204, "");
                return;
            }

            int index = (int) (Math.random() * INSIGHTS.length);
            String quote = escapeJson(INSIGHTS[index]);
            String json = "{\"index\":" + index + ",\"quote\":\"" + quote + "\"}";

            sendJsonResponse(exchange, 200, json);
        }
    }

    /**
     * /api/thoughts - Handles listing, adding, and clearing cognitive thought reflections.
     */
    static class ThoughtsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            String method = exchange.getRequestMethod().toUpperCase();

            switch (method) {
                case "OPTIONS":
                    sendResponse(exchange, 204, "");
                    break;

                case "GET":
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < THOUGHTS.size(); i++) {
                        ThoughtRecord t = THOUGHTS.get(i);
                        sb.append(t.toJson());
                        if (i < THOUGHTS.size() - 1) sb.append(",");
                    }
                    sb.append("]");
                    sendJsonResponse(exchange, 200, sb.toString());
                    break;

                case "POST":
                    String body = readRequestBody(exchange);
                    String text = extractJsonField(body, "text");
                    String tag = extractJsonField(body, "tag");
                    if (tag.isEmpty()) tag = "CLARITY";

                    if (text.isBlank()) {
                        sendJsonResponse(exchange, 400, "{\"error\":\"Thought text cannot be empty\"}");
                        return;
                    }

                    String id = UUID.randomUUID().toString().substring(0, 8);
                    String time = DateTimeFormatter.ofPattern("HH:mm:ss")
                                    .withZone(ZoneId.systemDefault())
                                    .format(Instant.now());

                    ThoughtRecord record = new ThoughtRecord(id, text, tag, time);
                    THOUGHTS.add(0, record); // prepend newest
                    persistThoughts();

                    sendJsonResponse(exchange, 201, record.toJson());
                    break;

                case "DELETE":
                    THOUGHTS.clear();
                    persistThoughts();
                    sendJsonResponse(exchange, 200, "{\"message\":\"All thought streams reset.\"}");
                    break;

                default:
                    sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                    break;
            }
        }
    }

    // =========================================================================
    // STATIC ASSETS SERVING
    // =========================================================================

    static class StaticFileHandler implements HttpHandler {
        private final Path publicDir = Paths.get("public");

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isBlank()) {
                path = "/index.html";
            }

            // Path traversal defense
            Path targetFile = publicDir.resolve(path.substring(1)).normalize();
            if (!targetFile.startsWith(publicDir)) {
                sendResponse(exchange, 403, "Access Denied");
                return;
            }

            if (!Files.exists(targetFile) || Files.isDirectory(targetFile)) {
                // If not found, serve index.html for SPA routing fallback
                Path fallback = publicDir.resolve("index.html");
                if (Files.exists(fallback)) {
                    targetFile = fallback;
                } else {
                    sendResponse(exchange, 404, "Sanctuary asset not found");
                    return;
                }
            }

            String mime = getMimeType(targetFile.toString());
            byte[] bytes = Files.readAllBytes(targetFile);

            exchange.getResponseHeaders().set("Content-Type", mime);
            exchange.getResponseHeaders().set("Cache-Control", "public, max-age=3600");
            setCORS(exchange);

            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String getMimeType(String filename) {
            if (filename.endsWith(".html")) return "text/html; charset=UTF-8";
            if (filename.endsWith(".css"))  return "text/css; charset=UTF-8";
            if (filename.endsWith(".js"))   return "application/javascript; charset=UTF-8";
            if (filename.endsWith(".json")) return "application/json; charset=UTF-8";
            if (filename.endsWith(".svg"))  return "image/svg+xml";
            if (filename.endsWith(".png"))  return "image/png";
            if (filename.endsWith(".ico"))  return "image/x-icon";
            if (filename.endsWith(".woff2"))return "font/woff2";
            return "application/octet-stream";
        }
    }

    // =========================================================================
    // MODELS & STORAGE HELPERS
    // =========================================================================

    static class ThoughtRecord {
        final String id;
        final String text;
        final String tag;
        final String time;

        ThoughtRecord(String id, String text, String tag, String time) {
            this.id = id;
            this.text = text;
            this.tag = tag;
            this.time = time;
        }

        String toJson() {
            return String.format(
                "{\"id\":\"%s\",\"text\":\"%s\",\"tag\":\"%s\",\"time\":\"%s\"}",
                escapeJson(id), escapeJson(text), escapeJson(tag), escapeJson(time)
            );
        }
    }

    private static synchronized void persistThoughts() {
        try {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < THOUGHTS.size(); i++) {
                sb.append(THOUGHTS.get(i).toJson());
                if (i < THOUGHTS.size() - 1) sb.append(",");
            }
            sb.append("]");
            Files.writeString(Paths.get(DATA_FILE), sb.toString(), StandardCharsets.UTF_8);
        } catch (Exception ignored) {}
    }

    private static synchronized void loadPersistedThoughts() {
        Path path = Paths.get(DATA_FILE);
        if (!Files.exists(path)) return;
        try {
            String content = Files.readString(path, StandardCharsets.UTF_8).trim();
            if (content.startsWith("[") && content.endsWith("]")) {
                content = content.substring(1, content.length() - 1).trim();
                if (content.isEmpty()) return;
                // Simple parsing for flat records
                String[] items = content.split("(?<=\\}),\\s*(?=\\{)");
                for (String item : items) {
                    String id = extractJsonField(item, "id");
                    String text = extractJsonField(item, "text");
                    String tag = extractJsonField(item, "tag");
                    String time = extractJsonField(item, "time");
                    if (!text.isEmpty()) {
                        THOUGHTS.add(new ThoughtRecord(id, text, tag, time));
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    private static String extractJsonField(String json, String field) {
        if (json == null) return "";
        String pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            return m.group(1).replace("\\\"", "\"").replace("\\\\", "\\");
        }
        return "";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private static void setCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void sendResponse(HttpExchange exchange, int status, String text) throws IOException {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[1024];
            int n;
            while ((n = is.read(buf)) != -1) {
                baos.write(buf, 0, n);
            }
            return baos.toString(StandardCharsets.UTF_8);
        }
    }

    private static void printBanner(int port) {
        System.out.println("=================================================================");
        System.out.println("  _    _ _____  _     _ _____ ______");
        System.out.println(" / \\  | |_   _|| |   | |_   _||  _  \\");
        System.out.println("/ _ \\ | | | |  | |___| | | |  | | | |");
        System.out.println("/ /_\\ \\| | | |  |  ___  | | |  | | | |");
        System.out.println("/ ___  \\| |_| |_| |   | |_| |_ | |/ / ");
        System.out.println("/_/   \\_\\___|___\\_|   |_/_____/|___/  // COGNITIVE SANCTUARY");
        System.out.println("=================================================================");
        System.out.println("[+] Sanctuary Online Port: http://localhost:" + port);
        System.out.println("[+] Core Engine: Java HTTP " + System.getProperty("java.version"));
        System.out.println("[+] Active State: Pure Zero-Dependency Architecture");
        System.out.println("=================================================================\n");
    }
}
