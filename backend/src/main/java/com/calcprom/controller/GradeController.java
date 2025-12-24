package com.calcprom.controller;

import com.calcprom.model.Ciclo;
import com.calcprom.service.GradeCalculator;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class GradeController {

    @PostMapping("/calculate")
    public Map<String, Object> calculateGlobalAverage(@RequestBody List<Ciclo> ciclos) {
        double promedio = GradeCalculator.calcularPromedioMatricula(ciclos);

        // Return structured JSON
        Map<String, Object> response = new HashMap<>();
        response.put("promedioMatricula", promedio);
        return response;
    }
}
