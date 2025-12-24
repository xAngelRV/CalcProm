package com.calcprom;

import com.calcprom.model.Ciclo;
import com.calcprom.model.Curso;
import com.calcprom.service.GradeCalculator;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Verificación de Ciclos y Promedio Recursivo ===");

        // Ciclo 1: 2 Cursos (Promedios 14 y 16 -> PromCiclo = 15)
        // Curso A: 14
        Map<String, Double> notasA = new HashMap<>();
        notasA.put("PC1", 14.0);
        notasA.put("PC2", 14.0);
        notasA.put("PC3", 14.0);
        notasA.put("PC4", 14.0);
        notasA.put("EP", 14.0);
        notasA.put("EF", 14.0);
        Curso c1 = new Curso("C1", 2, Curso.MetodoCalificacion.A, notasA);

        // Curso B: 16
        Map<String, Double> notasB = new HashMap<>();
        notasB.put("PC1", 16.0);
        notasB.put("PC2", 16.0);
        notasB.put("PC3", 16.0);
        notasB.put("PC4", 16.0);
        notasB.put("EP", 16.0);
        notasB.put("EF", 16.0);
        Curso c2 = new Curso("C2", 2, Curso.MetodoCalificacion.B, notasB);

        List<Curso> cursosCiclo1 = new ArrayList<>();
        cursosCiclo1.add(c1);
        cursosCiclo1.add(c2);
        Ciclo ciclo1 = new Ciclo("Ciclo 1", cursosCiclo1);
        double promCiclo1 = GradeCalculator.calcularPromedioCiclo(ciclo1);
        System.out.println("Promedio Ciclo 1 (Esperado 15.0): " + promCiclo1);

        // Ciclo 2: Promedio 17
        Map<String, Double> notasC = new HashMap<>();
        notasC.put("PC1", 17.0);
        notasC.put("PC2", 17.0);
        notasC.put("PC3", 17.0);
        notasC.put("PC4", 17.0);
        notasC.put("EP", 17.0);
        notasC.put("EF", 17.0);
        Curso c3 = new Curso("C3", 4, Curso.MetodoCalificacion.A, notasC);

        List<Curso> cursosCiclo2 = new ArrayList<>();
        cursosCiclo2.add(c3);
        Ciclo ciclo2 = new Ciclo("Ciclo 2", cursosCiclo2);
        double promCiclo2 = GradeCalculator.calcularPromedioCiclo(ciclo2);
        System.out.println("Promedio Ciclo 2 (Esperado 17.0): " + promCiclo2);

        // Ciclo 3: Promedio 13
        Map<String, Double> notasD = new HashMap<>();
        notasD.put("PC1", 13.0);
        notasD.put("PC2", 13.0);
        notasD.put("PC3", 13.0);
        notasD.put("PC4", 13.0);
        notasD.put("EP", 13.0);
        notasD.put("EF", 13.0);
        Curso c4 = new Curso("C4", 3, Curso.MetodoCalificacion.A, notasD);

        List<Curso> cursosCiclo3 = new ArrayList<>();
        cursosCiclo3.add(c4);
        Ciclo ciclo3 = new Ciclo("Ciclo 3", cursosCiclo3);
        double promCiclo3 = GradeCalculator.calcularPromedioCiclo(ciclo3);
        System.out.println("Promedio Ciclo 3 (Esperado 13.0): " + promCiclo3);

        List<Ciclo> todosLosCiclos = new ArrayList<>();
        todosLosCiclos.add(ciclo1);
        todosLosCiclos.add(ciclo2);
        todosLosCiclos.add(ciclo3);

        // Calculo Matricula
        // 1: 15
        // 2: (15 + 17) / 2 = 16
        // 3: (16 + 13) / 2 = 14.5
        double promMatricula = GradeCalculator.calcularPromedioMatricula(todosLosCiclos);
        System.out.println("Promedio Matricula (Esperado 14.5): " + promMatricula);
    }
}
