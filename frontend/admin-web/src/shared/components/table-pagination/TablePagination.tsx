import { useSearchParams } from "react-router";

import { Button } from "../../shadcn/ui/button";
import { stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface Props {
    totalPages: number;
}

export const TablePagination = ({ totalPages }: Props) => {

    const [searchParams, setSearchParams] = useSearchParams();

    const queryPage = stringToNumberWithDefault(searchParams.get("page"), 1);
    const page = isNaN(+queryPage) ? 1 : +queryPage;

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;

        searchParams.set("page", page.toString());
        setSearchParams(searchParams);
    }

    return (
        <>
            <div className="w-full flex items-center justify-center space-x-2">

                <Button className={"px-8! h-10!"} variant="outline" size="sm" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </Button>

                {
                    totalPages <= 6 && (
                        Array.from({ length: totalPages }, (_, index) => (
                            <Button className={"w-9! h-9! px-0!"} key={index} variant={page === index + 1 ? "default" : "outline"} size="sm" onClick={() => handlePageChange(index + 1)}>
                                {index + 1}
                            </Button>
                        ))
                    )
                }

                {
                    totalPages > 6 && (() => {
                        const pages = [];
                        pages.push(1);
                        if (page > 4) {
                            pages.push("...");
                        }
                        const start = Math.max(2, page - 1);
                        const end = Math.min(totalPages - 1, page + 1);
                        for (let i = start; i <= end; i++) {
                            if (!pages.includes(i)) {
                                pages.push(i);
                            }
                        }
                        if (page < totalPages - 3) {
                            pages.push("...");
                        }
                        if (totalPages > 1 && !pages.includes(totalPages)) {
                            pages.push(totalPages);
                        }

                        return pages.map((p, index) => {
                            if (p === "...") {
                                return (
                                    <Button key={`more-${index}`} variant="ghost" size="sm" className={"px-0!"} disabled>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                );
                            } else {
                                return (
                                    <Button className={"w-9! h-9! px-0!"} key={p} variant={page === p ? "default" : "outline"} size="sm" onClick={() => handlePageChange(+p)}>
                                        {p}
                                    </Button>
                                );
                            }
                        });
                    })()
                }

                <Button className={"px-8! h-10!"} variant="outline" size="sm" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </>
    )
}
