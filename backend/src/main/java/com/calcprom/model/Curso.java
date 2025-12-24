package com.calcprom.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Curso {
    public enum MetodoCalificacion {
        A, B, C
    }

    private String nombre;
    private int creditos;
    private MetodoCalificacion metodo;
    // Keys: PC1, PC2, PC3, PC4, EP, EF, Susti, Monografia
    private Map<String, Double> notas;
}
