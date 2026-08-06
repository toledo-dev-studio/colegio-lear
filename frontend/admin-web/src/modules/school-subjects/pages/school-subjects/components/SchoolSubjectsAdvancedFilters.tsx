import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { SchoolSubjectFilter } from "@/interfaces/filters/school-subject.filter";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { useSearchEducationLevels } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevels";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const SchoolSubjectsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const searchAcademicLevelsMutation = useSearchAcademicLevels();
    const searchEducationLevelsMutation = useSearchEducationLevels();
    const schoolSubjectFilterLike: Partial<SchoolSubjectFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active")),
        academicLevelId: isValidValueWithDefault(searchParams.get("academic-level-id"), ""),
        academicLevel: {
            name: isValidValueWithDefault(searchParams.get("academic-level-name"), ""),
        },
        educationLevelId: isValidValueWithDefault(searchParams.get("education-level-id"), ""),
        educationLevel: {
            name: isValidValueWithDefault(searchParams.get("education-level-name"), "")
        }
    };

    // Use react hook form configuration
    const { control, handleSubmit, setValue, reset, watch } = useForm<Partial<SchoolSubjectFilter>>({
        defaultValues: schoolSubjectFilterLike
    });
    const academicLevel = watch("academicLevel");
    const academicLevelId = watch("academicLevelId");
    const educationLevel = watch("educationLevel");
    const educationLevelId = watch("educationLevelId");

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("is-active");
        searchParams.delete("academic-level-id");
        searchParams.delete("academic-level-name");
        searchParams.delete("education-level-id");
        searchParams.delete("education-level-name");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<SchoolSubjectFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.academicLevelId ? searchParams.set("academic-level-id", filter.academicLevelId) : searchParams.delete("academic-level-id");
        filter.academicLevel?.name ? searchParams.set("academic-level-name", filter.academicLevel.name) : searchParams.delete("academic-level-name");
        filter.educationLevelId ? searchParams.set("education-level-id", filter.educationLevelId) : searchParams.delete("education-level-id");
        filter.educationLevel?.name ? searchParams.set("education-level-name", filter.educationLevel?.name) : searchParams.delete("education-level-name");
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <SidePanel
                title={title}
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Limpiar filtros", handleClick: handleClickClearFilters }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Aplicar filtros", handleClick: handleSubmit(onSubmit) }}>

                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Nombre de la materia:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    {...field}
                                    placeholder="Nombre de la materia..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Nivel académico:</label>
                        <Controller
                            name="academicLevelId"
                            control={control}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={academicLevel?.name}
                                    selected={!!academicLevelId}
                                    placeholder="Busqueda de nivel académico"
                                    options={searchAcademicLevelsMutation.academicLevels}
                                    isSearching={searchAcademicLevelsMutation.isPending}
                                    onClearSelection={() => {
                                        setValue("academicLevel", undefined);
                                        setValue("academicLevelId", undefined);
                                        setValue("educationLevel", undefined);
                                        setValue("educationLevelId", undefined);
                                        searchAcademicLevelsMutation.clearSearchResult();
                                        searchEducationLevelsMutation.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: AcademicLevelResponse) => {
                                        setValue("academicLevel", option);
                                        setValue("academicLevelId", option.id);
                                        searchAcademicLevelsMutation.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchAcademicLevelsMutation.searchAsync({ query, isActive: true })}
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Grado educativo:</label>
                        <Controller
                            name="educationLevelId"
                            control={control}
                            disabled={!academicLevelId}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={educationLevel?.name}
                                    selected={!!educationLevelId}
                                    disabled={!academicLevelId}
                                    placeholder="Busqueda de grado educativo"
                                    options={searchEducationLevelsMutation.educationLevels}
                                    isSearching={searchEducationLevelsMutation.isPending}
                                    onClearSelection={() => {
                                        setValue("educationLevel", undefined);
                                        setValue("educationLevelId", undefined);
                                        searchEducationLevelsMutation.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: EducationLevelResponse) => {
                                        setValue("educationLevel", option);
                                        setValue("educationLevelId", option.id);
                                        searchEducationLevelsMutation.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchEducationLevelsMutation.searchAsync({ query, academicLevelId: academicLevelId, isActive: true })}
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="description">La materia escolarse encuentra activa o inactiva.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>
                </form>
            </SidePanel>
        </>
    );
}