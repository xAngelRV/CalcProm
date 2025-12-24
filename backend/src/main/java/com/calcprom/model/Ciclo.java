package com.calcprom.model;

import java.util.List;

public class Ciclo {
    private String nombre;
    private List<Curso> cursos;

    public Ciclo(String nombre, List<Curso> cursos) {
        this.nombre = nombre;
        this.cursos = cursos;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Curso> getCursos() {
        return cursos;
    }

    public void setCursos(List<Curso> cursos) {
        this.cursos = cursos;
    }
}
