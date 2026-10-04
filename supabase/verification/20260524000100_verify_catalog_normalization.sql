-- Phase 1 verification for the RUVTIER admin rebuild catalog normalization.
-- Run after applying migrations. Every row should return ok = true before
-- Phase 2 switches public reads to the normalized catalog layer.

select *
from public.verify_catalog_normalization()
order by check_name;

-- Helpful summary for CI/manual review.
select bool_and(ok) as catalog_normalization_ok
from public.verify_catalog_normalization();
