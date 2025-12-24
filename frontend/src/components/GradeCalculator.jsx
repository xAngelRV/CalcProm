import React, { useState, useEffect } from 'react';

const GradeCalculator = () => {
    // State is now a list of Cycles. Each cycle has an ID, name, and a list of courses.
    const [cycles, setCycles] = useState([{
        id: Date.now(),
        name: 'Ciclo 1',
        courses: []
    }]);

    const [isDirty, setIsDirty] = useState(false);

    // Load from LocalStorage on Mount
    useEffect(() => {
        const savedData = localStorage.getItem('gradeCalcData');
        if (savedData) {
            try {
                setCycles(JSON.parse(savedData));
                setIsDirty(false); // Clean state after load
            } catch (e) {
                console.error("Error loading data", e);
            }
        }
    }, []);

    // Unsaved Changes Warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requires this to be set
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);


    const saveData = () => {
        localStorage.setItem('gradeCalcData', JSON.stringify(cycles));
        setIsDirty(false);
        alert("✅ Datos guardados correctamente en el navegador.");
    };

    // Wrapper to mark as dirty
    const updateCyclesState = (newCycles) => {
        setCycles(newCycles);
        setIsDirty(true);
    };

    const METHODS = {
        A: "A: (PromPC + EP + EF) / 3",
        B: "B: (PromPC + EP + 2*EF) / 4",
        C: "C: (PromPC(4) + Mono - Min) / 4"
    };

    // --- Cycle Management ---
    const addCycle = () => {
        updateCyclesState([...cycles, {
            id: Date.now(),
            name: `Ciclo ${cycles.length + 1}`,
            courses: []
        }]);
    };

    const removeCycle = (cycleId) => {
        updateCyclesState(cycles.filter(c => c.id !== cycleId));
    };

    // --- Course Management within Cycle ---
    const addCourse = (cycleId) => {
        updateCyclesState(cycles.map(cycle => {
            if (cycle.id !== cycleId) return cycle;
            return {
                ...cycle,
                courses: [...cycle.courses, {
                    id: Date.now(),
                    name: `Curso ${cycle.courses.length + 1}`,
                    credits: 3,
                    method: 'A',
                    notes: { PC1: '', PC2: '', PC3: '', PC4: '', EP: '', EF: '', Susti: '', Monografia: '' }
                }]
            };
        }));
    };

    const removeCourse = (cycleId, courseId) => {
        updateCyclesState(cycles.map(cycle => {
            if (cycle.id !== cycleId) return cycle;
            return {
                ...cycle,
                courses: cycle.courses.filter(c => c.id !== courseId)
            };
        }));
    };

    const updateCourse = (cycleId, courseId, field, value) => {
        updateCyclesState(cycles.map(cycle => {
            if (cycle.id !== cycleId) return cycle;
            return {
                ...cycle,
                courses: cycle.courses.map(c =>
                    c.id === courseId ? { ...c, [field]: value } : c
                )
            };
        }));
    };

    const updateNote = (cycleId, courseId, noteKey, value) => {
        // Validation: 0 to 20
        if (value !== '') {
            const num = parseFloat(value);
            if (num < 0 || num > 20) return; // Ignore invalid inputs
        }

        updateCyclesState(cycles.map(cycle => {
            if (cycle.id !== cycleId) return cycle;
            return {
                ...cycle,
                courses: cycle.courses.map(c => {
                    if (c.id !== courseId) return c;
                    return {
                        ...c,
                        notes: {
                            ...c.notes,
                            [noteKey]: value === '' ? '' : parseFloat(value)
                        }
                    };
                })
            };
        }));
    };

    // --- Calculations ---
    const calculateCourseAverage = (course) => {
        const { method, notes } = course;
        const getVal = (key) => (typeof notes[key] === 'number' ? notes[key] : 0);
        const pcs = [getVal('PC1'), getVal('PC2'), getVal('PC3'), getVal('PC4')];

        const calcPromPC = () => {
            const minPC = Math.min(...pcs);
            const sumPC = pcs.reduce((a, b) => a + b, 0);
            return (sumPC - minPC) / 3;
        };

        let ep = getVal('EP');
        let ef = getVal('EF');
        const susti = getVal('Susti');

        if (notes['Susti'] !== '' && notes['Susti'] !== undefined) {
            if (ep < ef) {
                if (susti > ep) ep = susti;
            } else {
                if (susti > ef) ef = susti;
            }
        }

        if (method === 'A') {
            const promPC = calcPromPC();
            return (promPC + ep + ef) / 3;
        } else if (method === 'B') {
            const promPC = calcPromPC();
            return (promPC + ep + 2 * ef) / 4;
        } else if (method === 'C') {
            const mono = getVal('Monografia');
            const all = [...pcs, mono];
            const minAll = Math.min(...all);
            const sumAll = all.reduce((a, b) => a + b, 0);
            return (sumAll - minAll) / 4;
        }
        return 0;
    };

    const calculateCycleAverage = (cycle) => {
        let totalProd = 0;
        let totalCreds = 0;
        cycle.courses.forEach(c => {
            const avg = calculateCourseAverage(c);
            const creds = parseFloat(c.credits) || 0;
            totalProd += avg * creds;
            totalCreds += creds;
        });
        return totalCreds === 0 ? 0 : totalProd / totalCreds;
    };

    // Recursive Global Average
    // Logic: Avg(0)=P0; Avg(i)=(Avg(i-1) + Pi) / 2
    const calculateGlobalRecursive = () => {
        if (cycles.length === 0) return 0;

        let currentAvg = 0;
        let first = true;

        for (const cycle of cycles) {
            const cycleAvg = calculateCycleAverage(cycle);
            if (first) {
                currentAvg = cycleAvg;
                first = false;
            } else {
                currentAvg = (currentAvg + cycleAvg) / 2;
            }
        }
        return currentAvg;
    };

    // --- Backend Integration ---
    const [backendAvg, setBackendAvg] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debounce API call to avoid spamming while typing
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGlobalAverage();
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [cycles]);

    const fetchGlobalAverage = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/api/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cycles)
            });

            if (response.ok) {
                const data = await response.json();
                setBackendAvg(data.promedioMatricula);
            } else {
                console.error("API Error");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="calculator-container">
            <header>
                <h1>Calculadora de Matricula (Full Stack)</h1>
                <div className="header-actions">
                    <button className="btn-save" onClick={saveData} disabled={!isDirty}>
                        {isDirty ? '💾 Guardar *' : '💾 Guardado'}
                    </button>
                    <button className="btn-add" onClick={addCycle}>+ Agregar Ciclo</button>
                </div>
            </header>


            <div className="cycles-list">
                {cycles.map((cycle, index) => (
                    <div key={cycle.id} className="cycle-container">
                        <div className="cycle-header-bar">
                            <input
                                type="text"
                                value={cycle.name}
                                onChange={(e) => updateCyclesState(cycles.map(c => c.id === cycle.id ? { ...c, name: e.target.value } : c))}
                                className="input-name"
                                style={{ fontSize: '1.5rem', width: 'auto' }}
                            />
                            <div className="cycle-controls">
                                <span className="cycle-avg">Promedio Ciclo: {calculateCycleAverage(cycle).toFixed(2)}</span>
                                <button className="btn-add-course" onClick={() => addCourse(cycle.id)}>+ Curso</button>
                                <button className="btn-remove-cycle" onClick={() => removeCycle(cycle.id)}>Eliminar Ciclo</button>
                            </div>
                        </div>

                        <div className="courses-list">
                            {cycle.courses.map(course => (
                                <div key={course.id} className="course-card">
                                    <div className="course-header">
                                        <input
                                            type="text"
                                            value={course.name}
                                            onChange={(e) => updateCourse(cycle.id, course.id, 'name', e.target.value)}
                                            placeholder="Nombre del Curso"
                                            className="input-name"
                                        />
                                        <div className="course-meta">
                                            <label>Créditos:
                                                <input
                                                    type="number"
                                                    value={course.credits}
                                                    onChange={(e) => updateCourse(cycle.id, course.id, 'credits', e.target.value)}
                                                    className="input-credits"
                                                    min="1"
                                                />
                                            </label>
                                            <label>Método:
                                                <select
                                                    value={course.method}
                                                    onChange={(e) => updateCourse(cycle.id, course.id, 'method', e.target.value)}
                                                    className="select-method"
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                </select>
                                            </label>
                                            <button className="btn-remove" onClick={() => removeCourse(cycle.id, course.id)}>X</button>
                                        </div>
                                    </div>

                                    <div className="notes-grid">
                                        {['PC1', 'PC2', 'PC3', 'PC4'].map(k => (
                                            <div key={k} className="note-input">
                                                <label>{k}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={course.notes[k]}
                                                    onChange={(e) => updateNote(cycle.id, course.id, k, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                        {(course.method === 'A' || course.method === 'B') && (
                                            <>
                                                <div className="note-input">
                                                    <label>EP</label>
                                                    <input type="number" step="0.1" value={course.notes['EP']} onChange={(e) => updateNote(cycle.id, course.id, 'EP', e.target.value)} />
                                                </div>
                                                <div className="note-input">
                                                    <label>EF</label>
                                                    <input type="number" step="0.1" value={course.notes['EF']} onChange={(e) => updateNote(cycle.id, course.id, 'EF', e.target.value)} />
                                                </div>
                                                <div className="note-input susti">
                                                    <label>Susti</label>
                                                    <input type="number" step="0.1" value={course.notes['Susti']} onChange={(e) => updateNote(cycle.id, course.id, 'Susti', e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                        {course.method === 'C' && (
                                            <div className="note-input">
                                                <label>Mono</label>
                                                <input type="number" step="0.1" value={course.notes['Monografia']} onChange={(e) => updateNote(cycle.id, course.id, 'Monografia', e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="course-footer">
                                        <span className="avg-label">Promedio: </span>
                                        <span className="avg-value">{calculateCourseAverage(course).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="global-footer">
                <h2>Promedio Matricula: <span className="highlight">
                    {loading ? '...' : (backendAvg !== null ? backendAvg.toFixed(2) : calculateGlobalRecursive().toFixed(2))}
                </span></h2>
            </footer>
        </div>
    );
};

export default GradeCalculator;
