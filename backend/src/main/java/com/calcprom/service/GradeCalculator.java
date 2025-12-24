package com.calcprom.service;

import com.calcprom.model.Curso;
import com.calcprom.model.Ciclo;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

public class GradeCalculator {

    public static double calcularPromedioCurso(Curso curso) {
        Map<String, Double> notas = curso.getNotas();
        if (notas == null || notas.isEmpty())
            return 0.0;

        switch (curso.getMetodo()) {
            case A:
                return calcularMetodoA(notas);
            case B:
                return calcularMetodoB(notas);
            case C:
                return calcularMetodoC(notas);
            default:
                return 0.0;
        }
    }

    private static double getNota(Map<String, Double> notas, String key) {
        return notas.getOrDefault(key, 0.0);
    }

    private static double calcularPromedioPracticas(Map<String, Double> notas) {
        List<Double> pcs = new ArrayList<>();
        pcs.add(getNota(notas, "PC1"));
        pcs.add(getNota(notas, "PC2"));
        pcs.add(getNota(notas, "PC3"));
        pcs.add(getNota(notas, "PC4"));

        double min = Collections.min(pcs);
        double sum = pcs.stream().mapToDouble(Double::doubleValue).sum();

        return (sum - min) / 3.0;
    }

    private static double calcularMetodoA(Map<String, Double> notas) {
        double ep = getNota(notas, "EP");
        double ef = getNota(notas, "EF");
        double susti = getNota(notas, "Susti");

        if (notas.containsKey("Susti")) {
            if (ep < ef) {
                if (susti > ep)
                    ep = susti;
            } else {
                if (susti > ef)
                    ef = susti;
            }
        }

        double promPC = calcularPromedioPracticas(notas);
        return (promPC + ep + ef) / 3.0;
    }

    private static double calcularMetodoB(Map<String, Double> notas) {
        double ep = getNota(notas, "EP");
        double ef = getNota(notas, "EF");
        double susti = getNota(notas, "Susti");

        if (notas.containsKey("Susti")) {
            if (ep < ef) {
                if (susti > ep)
                    ep = susti;
            } else {
                if (susti > ef)
                    ef = susti;
            }
        }

        double promPC = calcularPromedioPracticas(notas);
        return (promPC + ep + 2 * ef) / 4.0;
    }

    private static double calcularMetodoC(Map<String, Double> notas) {
        List<Double> all = new ArrayList<>();
        all.add(getNota(notas, "PC1"));
        all.add(getNota(notas, "PC2"));
        all.add(getNota(notas, "PC3"));
        all.add(getNota(notas, "PC4"));
        all.add(getNota(notas, "Monografia"));

        double min = Collections.min(all);
        double sum = all.stream().mapToDouble(Double::doubleValue).sum();

        return (sum - min) / 4.0;
    }

    public static double calcularPromedioPonderado(List<Curso> cursos) {
        double sumProd = 0.0;
        double sumCreds = 0.0;

        for (Curso c : cursos) {
            double prom = calcularPromedioCurso(c);
            sumProd += prom * c.getCreditos();
            sumCreds += c.getCreditos();
        }

        return (sumCreds == 0) ? 0.0 : sumProd / sumCreds;
    }

    // --- New Cycle Logic ---

    public static double calcularPromedioCiclo(Ciclo ciclo) {
        if (ciclo.getCursos() == null || ciclo.getCursos().isEmpty())
            return 0.0;
        return calcularPromedioPonderado(ciclo.getCursos());
    }

    public static double calcularPromedioMatricula(List<Ciclo> ciclos) {
        if (ciclos == null || ciclos.isEmpty())
            return 0.0;

        double currentAvg = 0.0;
        // Logic: Avg(0) = P0; Avg(i) = (Avg(i-1) + Pi) / 2
        for (int i = 0; i < ciclos.size(); i++) {
            double promCiclo = calcularPromedioCiclo(ciclos.get(i));
            if (i == 0) {
                currentAvg = promCiclo;
            } else {
                currentAvg = (currentAvg + promCiclo) / 2.0;
            }
        }

        return currentAvg;
    }
}
